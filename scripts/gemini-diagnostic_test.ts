import { runDiagnostic } from "./gemini-diagnostic.ts";

function assert(value: unknown): asserts value {
  if (!value) throw new Error("Assertion failed");
}
const fixtureKey = "private-fixture-key";
const env = (name: string) =>
  name === "GEMINI_API_KEY" ? fixtureKey : undefined;
const model = "gemini-3.8-flash";
const listed = (name = model) => ({
  name: `models/${name}`,
  supportedGenerationMethods: ["generateContent"],
});
const reply = (text = "OK", finishReason = "STOP") =>
  Response.json({
    candidates: [{ finishReason, content: { parts: [{ text }] } }],
  });

Deno.test("list-only paginates without any generation request", async () => {
  const events: Record<string, unknown>[] = [];
  const methods: string[] = [];
  const result = await runDiagnostic({
    env,
    listOnly: true,
    write: (event) => events.push(event),
    fetcher: ((request) => {
      assert(request instanceof Request);
      methods.push(request.method);
      return Promise.resolve(Response.json(methods.length === 1
        ? { models: [listed()], nextPageToken: "next" }
        : { models: [listed("gemini-3.5-flash-lite")] }));
    }) as typeof fetch,
  });
  assert(result && methods.join(",") === "GET,GET");
  assert(events.at(-1)!.event === "models_list");
  assert(!events.some((event) => event.event === "minimal_prompt"));
});

Deno.test("header-accepted control characters stop before fetch", async () => {
  for (const key of ["fixture\tkey", "fixture\u007fkey"]) {
    const events: Record<string, unknown>[] = [];
    let calls = 0;
    const result = await runDiagnostic({
      env: (name) => name === "GEMINI_API_KEY" ? key : undefined,
      write: (event) => events.push(event),
      fetcher: (() => { calls++; throw new Error("unexpected fetch"); }) as typeof fetch,
    });
    assert(!result && calls === 0);
    assert(events[0].headerValid === true);
    assert((events[0].keyFormatting as Record<string, boolean>).containsControlCharacters);
    assert(!JSON.stringify(events).includes(key));
  }
});

Deno.test("diagnostic paginates models and makes one minimal request with protected headers", async () => {
  const events: Record<string, unknown>[] = [];
  const calls: Request[] = [];
  const result = await runDiagnostic({
    env,
    write: (event) => events.push(event),
    fetcher: ((request) => {
      assert(request instanceof Request);
      calls.push(request);
      if (calls.length === 1) {
        return Promise.resolve(
          Response.json({
            models: [listed()],
            nextPageToken: "private-page-token",
          }),
        );
      }
      if (calls.length === 2) {
        return Promise.resolve(
          Response.json({
            models: [listed("gemini-3.5-flash-lite"), {
              name: "models/embedding-only",
              supportedGenerationMethods: ["embedContent"],
            }],
          }),
        );
      }
      return Promise.resolve(reply());
    }) as typeof fetch,
  });
  assert(result && calls.length === 3);
  for (const call of calls) {
    assert(new Headers(call.headers).get("x-goog-api-key") === fixtureKey);
    assert(call.redirect === "error" && !call.url.includes(fixtureKey));
  }
  assert(calls[1].url.includes("pageToken=private-page-token"));
  const payload = await calls[2].json();
  assert(payload.contents[0].parts[0].text === "Reply with exactly OK.");
  assert(Object.keys(payload).length === 1);
  const list = events.find((event) => event.event === "models_list")!;
  assert(
    list.listingComplete && list.baselineModelListed &&
      list.configuredModelListed,
  );
  assert((list.generateContentModels as string[]).length === 2);
  const generation = events.at(-1)!;
  assert(
    generation.httpStatus === 200 && generation.generationSucceeded &&
      generation.replyMatchedOK,
  );
  assert(typeof generation.elapsedMs === "number" && generation.elapsedMs >= 0);
  assert(
    !JSON.stringify(events).includes(fixtureKey) &&
      !JSON.stringify(events).includes("private-page-token"),
  );
});

Deno.test("listing success does not imply inference success; 503 is summarized without retries", async () => {
  const events: Record<string, unknown>[] = [];
  let calls = 0;
  const result = await runDiagnostic({
    env,
    write: (event) => events.push(event),
    fetcher: (() =>
      Promise.resolve(
        ++calls === 1 ? Response.json({ models: [listed()] }) : Response.json({
          error: {
            message: `private-prompt ${fixtureKey} Bearer private-token`,
          },
        }, { status: 503 }),
      )) as typeof fetch,
  });
  assert(!result && calls === 2);
  assert(
    events.at(-1)!.httpStatus === 503 &&
      events.at(-1)!.generationSucceeded === false,
  );
  assert(String(events.at(-1)!.summary).includes("503"));
  for (
    const value of [
      fixtureKey,
      "private-prompt",
      "private-token",
      "Authorization",
    ]
  ) assert(!JSON.stringify(events).includes(value));
});

Deno.test("missing key or invalid model stops without fetching or printing configuration values", async () => {
  for (
    const config of [{}, {
      GEMINI_API_KEY: fixtureKey,
      GEMINI_MODEL: "Bearer private-token",
    }]
  ) {
    const values = config as Record<string, string>;
    const events: Record<string, unknown>[] = [];
    const result = await runDiagnostic({
      env: (name) => values[name],
      write: (event) => events.push(event),
      fetcher: (() => {
        throw new Error("Must not fetch");
      }) as typeof fetch,
    });
    assert(!result && events[0].event === "configuration_error");
    assert(
      !JSON.stringify(events).includes(fixtureKey) &&
        !JSON.stringify(events).includes("private-token"),
    );
  }
});

Deno.test("configured model is tested without fallback even when absent from model metadata", async () => {
  const events: Record<string, unknown>[] = [];
  const paths: string[] = [];
  const result = await runDiagnostic({
    env: (name) =>
      name === "GEMINI_MODEL" ? " gemini-3.5-flash-lite " : env(name),
    write: (event) => events.push(event),
    fetcher: ((url) => {
      assert(url instanceof Request);
      paths.push(url.url);
      return Promise.resolve(
        paths.length === 1 ? Response.json({ models: [listed()] }) : reply(),
      );
    }) as typeof fetch,
  });
  assert(
    result && paths.length === 2 &&
      paths[1].includes("gemini-3.5-flash-lite:generateContent"),
  );
  const list = events.find((event) => event.event === "models_list")!;
  assert(
    list.configuredModelListed === false && list.baselineModelListed === true,
  );
  assert(events.at(-1)!.model === "gemini-3.5-flash-lite");
});

Deno.test("failed or malformed model listing reports unknown availability and still attempts generation", async () => {
  for (
    const first of [
      () => new Response("{", { status: 200 }),
      () => Response.json({}, { status: 403 }),
      () => {
        throw new Error(`private network ${fixtureKey}`);
      },
    ]
  ) {
    let calls = 0;
    const events: Record<string, unknown>[] = [];
    const result = await runDiagnostic({
      env,
      write: (event) => events.push(event),
      fetcher: (() =>
        ++calls === 1
          ? Promise.resolve(first())
          : Promise.resolve(reply())) as typeof fetch,
    });
    assert(!result && calls === 2);
    const list = events.find((event) => event.event === "models_list")!;
    assert(list.listingComplete === false && list.baselineModelListed === null);
    assert(events.at(-1)!.generationSucceeded === true);
    assert(!JSON.stringify(events).includes(fixtureKey));
  }
});

Deno.test("timeout cancels generation and records safe status and timing", async () => {
  let calls = 0;
  const events: Record<string, unknown>[] = [];
  const result = await runDiagnostic({
    env,
    timeoutMs: 5,
    write: (event) => events.push(event),
    fetcher: ((request) => {
      assert(request instanceof Request);
      if (++calls === 1) {
        return Promise.resolve(Response.json({ models: [listed()] }));
      }
      return new Promise((_resolve, reject) =>
        request.signal.addEventListener(
          "abort",
          () => reject(new Error(fixtureKey)),
        )
      );
    }) as typeof fetch,
  });
  assert(!result && calls === 2);
  const last = events.at(-1)!;
  assert(
    last.httpStatus === null && last.summary === "Request timed out." &&
      last.timeoutMs === 5,
  );
  assert(typeof last.elapsedMs === "number" && last.elapsedMs >= 1);
  assert(!JSON.stringify(events).includes(fixtureKey));
});

Deno.test("generated content and malformed or truncated completions are never printed", async () => {
  for (
    const completion of [
      () => reply(`private content ${fixtureKey}`),
      () => reply("private truncated", "MAX_TOKENS"),
      () => new Response("{private malformed"),
      () =>
        Response.json({
          promptFeedback: { blockReason: "SAFETY", private: fixtureKey },
        }),
    ]
  ) {
    let calls = 0;
    const events: Record<string, unknown>[] = [];
    await runDiagnostic({
      env,
      write: (event) => events.push(event),
      fetcher: (() =>
        Promise.resolve(
          ++calls === 1 ? Response.json({ models: [listed()] }) : completion(),
        )) as typeof fetch,
    });
    assert(events.at(-1)!.replyMatchedOK === false);
    assert(
      !JSON.stringify(events).includes(fixtureKey) &&
        !JSON.stringify(events).includes("private content") &&
        !JSON.stringify(events).includes("private truncated"),
    );
  }
});

Deno.test("invalid headers fail preflight without fetching or logging key content", async () => {
  for (
    const key of [
      "fixture-\u201ckey\u201d",
      "fixture-key\r\nprivate-line",
      "fixture-\u0000key",
    ]
  ) {
    const events: Record<string, unknown>[] = [];
    let calls = 0;
    const result = await runDiagnostic({
      env: (name) => name === "GEMINI_API_KEY" ? key : undefined,
      write: (event) => events.push(event),
      fetcher: (() => {
        calls++;
        throw new Error("Must not fetch");
      }) as typeof fetch,
    });
    assert(!result && calls === 0 && events.length === 1);
    const event = events[0];
    assert(
      event.event === "request_preflight" && event.headerValid === false &&
        event.signalAborted === false,
    );
    assert(event.errorCategory === "TypeError" && event.errorCode === null);
    assert(
      !JSON.stringify(events).includes(key) &&
        !JSON.stringify(events).includes("private-line"),
    );
  }
});

Deno.test("permission and transport errors expose only allowlisted categories and codes", async () => {
  for (
    const [error, category, code] of [
      [
        new Deno.errors.NotCapable(`denied private URL ${fixtureKey}`),
        "NotCapable",
        null,
      ],
      [
        new TypeError(`private fetch ${fixtureKey}`, {
          cause: { code: "ENOTFOUND", message: fixtureKey },
        }),
        "TypeError",
        "ENOTFOUND",
      ],
      [
        Object.assign(new Error(fixtureKey), { code: "ECONNREFUSED" }),
        "Error",
        "ECONNREFUSED",
      ],
      [
        {
          name: fixtureKey,
          code: fixtureKey,
          message: fixtureKey,
          cause: { code: "private-token" },
        },
        "Unknown",
        null,
      ],
    ] as const
  ) {
    const events: Record<string, unknown>[] = [];
    await runDiagnostic({
      env,
      write: (event) => events.push(event),
      fetcher: (() => Promise.reject(error)) as typeof fetch,
    });
    const attempts = events.filter((event) =>
      event.event === "models_page" || event.event === "minimal_prompt"
    );
    assert(attempts.length === 2);
    for (const event of attempts) {
      assert(
        event.headerValid === true && event.signalAborted === false &&
          event.httpStatus === null,
      );
      assert(event.errorCategory === category && event.errorCode === code);
      assert(typeof event.timeoutMs === "number");
    }
    for (
      const sensitive of [
        fixtureKey,
        "private-token",
        "private URL",
        "private fetch",
      ]
    ) assert(!JSON.stringify(events).includes(sensitive));
  }
});

Deno.test("timeout category reports an aborted signal while ordinary HTTP errors do not", async () => {
  for (const timedOut of [false, true]) {
    const events: Record<string, unknown>[] = [];
    let calls = 0;
    await runDiagnostic({
      env,
      timeoutMs: 5,
      write: (event) => events.push(event),
      fetcher: ((request) => {
        assert(request instanceof Request);
        if (++calls === 1) {
          return Promise.resolve(Response.json({ models: [listed()] }));
        }
        if (!timedOut) {
          return Promise.resolve(new Response(null, { status: 403 }));
        }
        return new Promise((_resolve, reject) =>
          request.signal.addEventListener(
            "abort",
            () => reject(new Error(fixtureKey)),
          )
        );
      }) as typeof fetch,
    });
    const event = events.at(-1)!;
    assert(event.headerValid === true && event.signalAborted === timedOut);
    assert(
      event.errorCategory === (timedOut ? "Timeout" : null) &&
        event.errorCode === null,
    );
    assert(
      event.timeoutMs === 5 && event.httpStatus === (timedOut ? null : 403),
    );
    assert(!JSON.stringify(events).includes(fixtureKey));
  }
});

Deno.test("valid preflight retains redirect protection and emits no credentials", async () => {
  const events: Record<string, unknown>[] = [];
  let calls = 0;
  await runDiagnostic({
    env,
    write: (event) => events.push(event),
    fetcher: ((request) => {
      assert(request instanceof Request);
      assert(request.redirect === "error");
      assert(new Headers(request.headers).get("x-goog-api-key") === fixtureKey);
      return Promise.resolve(
        ++calls === 1 ? Response.json({ models: [listed()] }) : reply(),
      );
    }) as typeof fetch,
  });
  assert(
    events[0].event === "request_preflight" && events[0].headerValid === true,
  );
  assert(
    events.at(-1)!.errorCategory === null &&
      events.at(-1)!.signalAborted === false,
  );
  assert(!JSON.stringify(events).includes(fixtureKey));
});

Deno.test("complete Request construction failures are distinguished from fetch execution", async () => {
  const NativeRequest = globalThis.Request;
  const events: Record<string, unknown>[] = [];
  let calls = 0;
  globalThis.Request = class extends NativeRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      super(input, init);
      throw new TypeError("private-construction-value");
    }
  };
  try {
    await runDiagnostic({
      env,
      write: (event) => events.push(event),
      fetcher: (() => {
        calls++;
        return Promise.resolve(reply());
      }) as typeof fetch,
    });
    const failures = events.filter((event) =>
      event.event === "models_page" || event.event === "minimal_prompt"
    );
    assert(calls === 0 && failures.length === 2);
    for (const event of failures) {
      assert(
        event.stage === "request_construction" && event.headerValid === true &&
          event.errorCategory === "TypeError",
      );
    }
    assert(!JSON.stringify(events).includes("private-construction-value"));
  } finally {
    globalThis.Request = NativeRequest;
  }
});

Deno.test("fetch execution and response reading failures have separate stages", async () => {
  for (const responseFailure of [false, true]) {
    const events: Record<string, unknown>[] = [];
    await runDiagnostic({
      env,
      write: (event) => events.push(event),
      fetcher: ((request) => {
        assert(
          request instanceof Request && request.redirect === "error" &&
            !request.signal.aborted,
        );
        if (!responseFailure) {
          throw new TypeError("private-fetch-value", {
            cause: Object.assign(new Error("private-cause"), {
              code: "ECONNRESET",
            }),
          });
        }
        return Promise.resolve(
          new Response("private invalid JSON", { status: 200 }),
        );
      }) as typeof fetch,
    });
    const failures = events.filter((event) =>
      event.event === "models_page" || event.event === "minimal_prompt"
    );
    for (const event of failures) {
      assert(
        event.stage === (responseFailure ? "response_read" : "fetch_execution"),
      );
      assert(event.httpStatus === (responseFailure ? 200 : null));
      assert(
        event.errorCategory === (responseFailure ? "SyntaxError" : "TypeError"),
      );
    }
    for (
      const forbidden of [
        "private-fetch-value",
        "private-cause",
        "private invalid JSON",
      ]
    ) assert(!JSON.stringify(events).includes(forbidden));
  }
});

Deno.test("nested cause chains are allowlisted, bounded and cycle safe", async () => {
  const cyclic = {
    name: "TypeError",
    code: "ENOTFOUND",
    message: fixtureKey,
    cause: null as unknown,
  };
  cyclic.cause = cyclic;
  let deep: unknown = {
    name: "TypeError",
    code: fixtureKey,
    message: fixtureKey,
  };
  for (let depth = 0; depth < 9; depth++) {
    deep = {
      name: depth === 8 ? "TypeError" : fixtureKey,
      code: depth === 7 ? "ETIMEDOUT" : fixtureKey,
      cause: deep,
      stack: fixtureKey,
    };
  }
  for (const error of [cyclic, deep]) {
    const events: Record<string, unknown>[] = [];
    await runDiagnostic({
      env,
      write: (event) => events.push(event),
      fetcher: (() => Promise.reject(error)) as typeof fetch,
    });
    const event = events.find((event) => event.event === "models_page")!;
    const chain = event.errorChain as { name: string; code: string | null }[];
    assert(chain.length === (error === cyclic ? 1 : 5));
    assert(chain[0].name === "TypeError");
    assert(
      chain.some((item) =>
        item.code === (error === cyclic ? "ENOTFOUND" : "ETIMEDOUT")
      ),
    );
    assert(
      chain.every((item) => Object.keys(item).sort().join(",") === "code,name"),
    );
    assert(!JSON.stringify(events).includes(fixtureKey));
  }
});

Deno.test("key formatting diagnostics contain booleans only and never expose key contents", async () => {
  for (
    const [key, whitespace, nonAscii, control, quote] of [
      [" fixture-key ", false, false, false, false],
      ["fixture key", true, false, false, false],
      ['"fixture-key"', false, false, false, true],
      ["fixture-\u00e9-key", false, true, false, false],
      ["fixture\nkey", true, false, true, false],
    ] as const
  ) {
    const events: Record<string, unknown>[] = [];
    await runDiagnostic({
      env: (name) => name === "GEMINI_API_KEY" ? key : undefined,
      write: (event) => events.push(event),
      fetcher: (() =>
        Promise.resolve(new Response(null, { status: 403 }))) as typeof fetch,
    });
    const preflight = events.find((event) =>
      event.event === "request_preflight"
    )!;
    const flags = preflight.keyFormatting as Record<string, boolean>;
    assert(
      flags.containsWhitespace === whitespace &&
        flags.containsNonAscii === nonAscii &&
        flags.containsControlCharacters === control &&
        flags.hasSurroundingQuote === quote,
    );
    assert(flags.outerWhitespaceTrimmed === (key !== key.trim()));
    assert(Object.values(flags).every((flag) => typeof flag === "boolean"));
    assert(!JSON.stringify(events).includes(key.trim()));
  }
});
