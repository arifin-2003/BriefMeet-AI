import {
  createResearchHandler,
  type GeminiDiagnosticEvent,
  normalizeSources,
  validateBriefing,
} from "./pipeline.ts";
import { withSupabase } from "@supabase/server";
import { exportJWK, generateKeyPair, SignJWT } from "jose";

function assert(
  condition: unknown,
  message = "Assertion failed",
): asserts condition {
  if (!condition) throw new Error(message);
}
const sourceResult = {
  title: "Company announcement",
  url: "https://example.com/news",
  content: "The company launched a new service.",
};
const sources = normalizeSources([sourceResult]);
function valid() {
  const fact = {
    text: "The company launched a service.",
    kind: "fact",
    sourceIds: ["source-1"],
  };
  return {
    executiveSummary: [fact],
    keyDevelopments: [fact],
    leadershipInsights: [],
    opportunities: [],
    risks: [],
    meetingQuestions: Array.from(
      { length: 5 },
      (_, i) => ({
        question: `How will service launch priority ${i + 1} be measured?`,
        rationale: "Discuss the announced service.",
        sourceIds: ["source-1"],
      }),
    ),
  };
}
function request(
  body: unknown = { targetName: "Example", targetType: "company" },
) {
  return new Request("https://local.test/research", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
const json = (body: unknown, status = 200) => Response.json(body, { status });
const gemini = (body: unknown = valid(), finishReason = "STOP") =>
  json({
    candidates: [{
      finishReason,
      content: { parts: [{ text: JSON.stringify(body) }] },
    }],
  });
const env = (name: string) =>
  name.endsWith("_API_KEY") ? "fixture-secret" : undefined;
function handler(
  second: () => Response | Promise<Response> = () => gemini(),
  first: () => Response | Promise<Response> = () =>
    json({ results: [sourceResult] }),
) {
  let calls = 0;
  return createResearchHandler({
    env,
    fetcher: (() => ++calls === 1 ? first() : second()) as typeof fetch,
  });
}

Deno.test("valid Gemini output and bounded, deduplicated HTTP sources", () => {
  assert(validateBriefing(valid(), sources).meetingQuestions.length === 5);
  const normalized = normalizeSources([
    sourceResult,
    { ...sourceResult, url: `${sourceResult.url}?utm_source=test#top` },
    { ...sourceResult, url: "javascript:alert(1)" },
    { ...sourceResult, url: "https://other.test", content: "x".repeat(5000) },
  ]);
  assert(normalized.length === 2 && normalized[1].content.length === 2400);
  assert(normalized[0].id === "source-1");
});

Deno.test("reject malformed fields, missing/unknown/duplicate citations and incomplete questions", () => {
  const cases: unknown[] = [null, {}, { ...valid(), executiveSummary: [] }, {
    ...valid(),
    meetingQuestions: [],
  }];
  for (const ids of [[], ["nonexistent"], ["source-1", "source-1"]]) {
    cases.push({
      ...valid(),
      executiveSummary: [{ text: "Claim", kind: "fact", sourceIds: ids }],
    });
  }
  cases.push({
    ...valid(),
    risks: [{ text: "Risk", kind: "fact", sourceIds: ["source-1"] }],
  });
  for (const value of cases) {
    let rejected = false;
    try {
      validateBriefing(value, sources);
    } catch {
      rejected = true;
    }
    assert(rejected);
  }
});

Deno.test("complete pipeline uses official Gemini schema, secret header and preserved Tavily options", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const run = createResearchHandler({
    env,
    fetcher: ((url, init) => {
      calls.push({ url: String(url), init: init! });
      return Promise.resolve(
        calls.length === 1 ? json({ results: [sourceResult] }) : gemini(),
      );
    }) as typeof fetch,
  });
  const response = await run(request());
  const body = await response.json();
  assert(
    response.status === 200 && body.status === "completed" &&
      body.provider === "tavily+gemini",
  );
  assert(!JSON.stringify(body).includes("fixture-secret"));
  assert(JSON.parse(calls[0].init.body as string).max_results === 5);
  assert(
    calls[1].url.includes(
      "generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    ),
  );
  const aiRequest = JSON.parse(calls[1].init.body as string);
  assert(
    aiRequest.generationConfig.responseJsonSchema &&
      aiRequest.systemInstruction,
  );
  assert(
    new Headers(calls[1].init.headers).get("x-goog-api-key") ===
      "fixture-secret",
  );
});

for (const status of [400, 403, 429, 500, 503]) {
  Deno.test(`Gemini HTTP ${status} preserves sources and rejects briefing`, async () => {
    const response = await handler(() =>
      json({ error: "private provider detail" }, status)
    )(request());
    const body = await response.json();
    assert(response.status === (status === 429 ? 429 : 502));
    assert(
      body.status === "failed" && body.briefing === null &&
        body.sources.length === 1,
    );
    assert(!JSON.stringify(body).includes("private provider detail"));
  });
}

Deno.test("invalid JSON, invalid citations, blocked and truncated Gemini completions fail safely", async () => {
  for (
    const response of [
      new Response("{"),
      json({
        candidates: [{
          finishReason: "STOP",
          content: { parts: [{ text: "{" }] },
        }],
      }),
      gemini({}, "MAX_TOKENS"),
      json({ promptFeedback: { blockReason: "SAFETY" } }),
      gemini({
        ...valid(),
        executiveSummary: [{
          text: "Claim",
          kind: "fact",
          sourceIds: ["unknown"],
        }],
      }),
    ]
  ) {
    const result = await handler(() => response)(request());
    const body = await result.json();
    assert(
      result.status === 502 && body.code === "GEMINI_INVALID" &&
        body.sources.length === 1 && body.briefing === null,
    );
  }
});

Deno.test("Tavily HTTP, network, malformed and empty results never invoke Gemini", async () => {
  for (
    const first of [
      () => json({}, 500),
      () => {
        throw new TypeError("private network detail");
      },
      () => new Response("{"),
      () => json({ results: null }),
    ]
  ) {
    const result = await handler(() => {
      throw new Error("Gemini must not run");
    }, first)(request());
    const body = await result.json();
    assert(
      result.status === 502 && body.status === "failed" &&
        body.sources.length === 0,
    );
  }
  const result = await handler(() => {
    throw new Error("Gemini must not run");
  }, () => json({ results: [] }))(request());
  const body = await result.json();
  assert(body.status === "empty" && body.briefing === null);
});

Deno.test("missing credentials and invalid model configuration return safe failures", async () => {
  for (const missing of ["TAVILY_API_KEY", "GEMINI_API_KEY", "GEMINI_MODEL"]) {
    const run = createResearchHandler({
      env: (name) =>
        name === missing
          ? (name === "GEMINI_MODEL" ? "../bad-model" : undefined)
          : env(name),
      fetcher: (() =>
        Promise.resolve(json({ results: [sourceResult] }))) as typeof fetch,
    });
    const response = await run(request());
    const body = await response.json();
    assert(response.status === 503 && body.status === "failed");
    assert(body.sources.length === (missing === "TAVILY_API_KEY" ? 0 : 1));
  }
});

Deno.test("Gemini and Tavily timeouts and network failures are sanitized", async () => {
  for (const stage of ["RESEARCH", "GEMINI"]) {
    let calls = 0;
    const run = createResearchHandler({
      env,
      researchTimeout: 5,
      geminiTimeout: 5,
      fetcher: ((_url, init) => {
        calls++;
        if (stage === "GEMINI" && calls === 1) {
          return Promise.resolve(json({ results: [sourceResult] }));
        }
        return new Promise((_resolve, reject) =>
          init?.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
          )
        );
      }) as typeof fetch,
    });
    const response = await run(request());
    const body = await response.json();
    assert(response.status === 504 && body.code === `${stage}_TIMEOUT`);
  }
  const result = await handler(() => {
    throw new TypeError("secret detail");
  })(request());
  assert((await result.json()).code === "GEMINI_NETWORK");
});

Deno.test("input types, malformed JSON, body size and method are validated before providers", async () => {
  const run = handler(() => {
    throw new Error("No provider expected");
  }, () => {
    throw new Error("No provider expected");
  });
  for (
    const input of [
      null,
      [],
      "name",
      {},
      { targetName: 123 },
      { targetName: "" },
      { targetName: "a".repeat(121) },
      { targetName: "Example", targetType: ["company"] },
      { targetName: "Example", targetType: "invalid" },
    ]
  ) assert((await run(request(input))).status === 400);
  assert(
    (await run(
      new Request("https://local.test", { method: "POST", body: "{" }),
    )).status === 400,
  );
  assert((await run(request({ targetName: "x".repeat(5000) }))).status === 413);
  assert((await run(new Request("https://local.test"))).status === 405);
});

Deno.test("actual Supabase wrapper rejects missing, API key and malformed bearer credentials", async () => {
  let calls = 0;
  const wrapped = withSupabase({
    auth: ["user"],
    env: {
      url: "https://project.supabase.co",
      publishableKeys: {},
      secretKeys: {},
      jwks: { keys: [] },
    },
  }, () => {
    calls++;
    return Promise.resolve(json({}));
  });
  for (
    const headers of [
      new Headers(),
      new Headers({ Authorization: "Bearer invalid" }),
      new Headers({ apikey: "sb_publishable_fixture" }),
    ]
  ) {
    const response = await wrapped(
      new Request("https://local.test", { method: "POST", headers }),
    );
    assert(response.status >= 400 && calls === 0);
    await response.body?.cancel();
  }
});

Deno.test("Supabase wrapper accepts signed user JWT and reaches validated pipeline", async () => {
  const { publicKey, privateKey } = await generateKeyPair("ES256");
  const jwk = {
    ...await exportJWK(publicKey),
    kid: "fixture",
    alg: "ES256",
    use: "sig",
  };
  const token = await new SignJWT({ role: "authenticated" }).setProtectedHeader(
    { alg: "ES256", kid: "fixture" },
  )
    .setSubject("user-fixture").setIssuedAt().setExpirationTime("5m").setIssuer(
      "https://project.supabase.co/auth/v1",
    ).setAudience("authenticated").sign(privateKey);
  const wrapped = withSupabase({
    auth: ["user"],
    env: {
      url: "https://project.supabase.co",
      publishableKeys: { default: "sb_publishable_fixture" },
      secretKeys: {},
      jwks: { keys: [jwk] },
    },
  }, handler());
  const req = request();
  req.headers.set("Authorization", `Bearer ${token}`);
  const response = await wrapped(req);
  const body = await response.json();
  assert(response.status === 200 && body.status === "completed");
});
Deno.test("GEMINI_MODEL override is trimmed and blank values retain the supported default", async () => {
  for (const configured of [" gemini-3.5-flash-lite ", "", "   "]) {
    let calls = 0;
    let geminiUrl = "";
    const run = createResearchHandler({
      env: (name) => name === "GEMINI_MODEL" ? configured : env(name),
      fetcher: ((url) => {
        calls++;
        if (calls === 1) {
          return Promise.resolve(json({ results: [sourceResult] }));
        }
        geminiUrl = String(url);
        return Promise.resolve(gemini());
      }) as typeof fetch,
    });
    const response = await run(request());
    const body = await response.json();
    const expected = configured.trim() || "gemini-2.5-flash";
    assert(response.status === 200 && body.status === "completed");
    assert(
      geminiUrl ===
        `https://generativelanguage.googleapis.com/v1beta/models/${expected}:generateContent`,
    );
  }
});

Deno.test("Gemini diagnostics include HTTP status, provider code/status and privacy-safe message", async () => {
  const events: GeminiDiagnosticEvent[] = [];
  let calls = 0;
  const privateText =
    "sensitive-user-name sensitive-source-content fixture-secret Bearer private-token private@example.com";
  const run = createResearchHandler({
    env,
    logDiagnostic: (event: GeminiDiagnosticEvent) => events.push({ ...event }),
    fetcher: (() =>
      Promise.resolve(
        ++calls === 1 ? json({ results: [sourceResult] }) : json({
          error: {
            code: 400,
            status: "INVALID_ARGUMENT",
            message: `Invalid responseJsonSchema: ${privateText}`,
            details: [{
              prompt: privateText,
              headers: { "x-goog-api-key": "fixture-secret" },
            }],
          },
        }, 400),
      )) as typeof fetch,
  });
  const response = await run(
    request({ targetName: "sensitive-user-name", targetType: "company" }),
  );
  const body = await response.json();
  assert(
    response.status === 502 && body.code === "GEMINI_UNAVAILABLE" &&
      body.sources.length === 1,
  );
  assert(body.error === "AI provider unavailable. Please try again.");
  assert(events.length === 1);
  const event = events[0];
  assert(event.event === "gemini_failure" && event.stage === "api_request");
  assert(
    event.model === "gemini-2.5-flash" && event.httpStatus === 400 &&
      event.providerCode === 400,
  );
  assert(event.providerStatus === "INVALID_ARGUMENT");
  assert(String(event.providerMessage).includes("structured-output schema"));
  const logged = JSON.stringify(events);
  for (
    const secret of privateText.split(" ").concat([
      sourceResult.content,
      sourceResult.title,
      "systemInstruction",
      "headers",
    ])
  ) assert(!logged.includes(secret));
  assert(!JSON.stringify(body).includes("providerMessage"));
});

Deno.test("diagnostics distinguish provider JSON, generated JSON, truncation and briefing validation", async () => {
  const cases = [
    {
      response: () => new Response("{", { status: 200 }),
      stage: "response_parsing",
      reason: "provider_json_invalid",
    },
    {
      response: () =>
        json({
          candidates: [{
            finishReason: "STOP",
            content: { parts: [{ text: "{ secret output" }] },
          }],
        }),
      stage: "response_parsing",
      reason: "briefing_json_invalid",
    },
    {
      response: () => gemini({}, "MAX_TOKENS"),
      stage: "response_parsing",
      reason: "output_token_limit",
    },
    {
      response: () =>
        gemini({
          ...valid(),
          executiveSummary: [{
            text: "secret finding",
            kind: "fact",
            sourceIds: ["missing"],
          }],
        }),
      stage: "briefing_validation",
      reason: "invalid_schema_or_citations",
    },
  ];
  for (const item of cases) {
    const events: GeminiDiagnosticEvent[] = [];
    let calls = 0;
    const run = createResearchHandler({
      env,
      logDiagnostic: (event: GeminiDiagnosticEvent) =>
        events.push({ ...event }),
      fetcher: (() =>
        Promise.resolve(
          ++calls === 1 ? json({ results: [sourceResult] }) : item.response(),
        )) as typeof fetch,
    });
    const response = await run(request());
    const body = await response.json();
    assert(
      response.status === 502 && body.sources.length === 1 &&
        body.briefing === null,
    );
    assert(
      events.length === 1 && events[0].stage === item.stage &&
        events[0].reason === item.reason && events[0].httpStatus === 200,
    );
    assert(!JSON.stringify(events).includes("secret"));
  }
});

Deno.test("diagnostic collection handles oversized, malformed and unrecognized provider errors safely", async () => {
  for (
    const response of [
      new Response("private body".repeat(1000), { status: 503 }),
      new Response("{ private malformed", { status: 503 }),
      json({
        error: {
          code: "private-code",
          status: "PRIVATE_USER_DATA",
          message: "private user data",
          details: { value: "fixture-secret" },
        },
      }, 503),
    ]
  ) {
    let calls = 0;
    const events: GeminiDiagnosticEvent[] = [];
    const run = createResearchHandler({
      env,
      logDiagnostic: (event: GeminiDiagnosticEvent) =>
        events.push({ ...event }),
      fetcher: (() =>
        Promise.resolve(
          ++calls === 1 ? json({ results: [sourceResult] }) : response,
        )) as typeof fetch,
    });
    const result = await run(request());
    assert(result.status === 502 && (await result.json()).sources.length === 1);
    assert(events.length === 1 && events[0].httpStatus === 503);
    assert(
      events[0].providerCode === null && events[0].providerStatus === null,
    );
    assert(!JSON.stringify(events).includes("private"));
  }
});

Deno.test("network failures log no exception details and diagnostic sink failures preserve the response", async () => {
  const events: GeminiDiagnosticEvent[] = [];
  for (const throwingLogger of [false, true]) {
    let calls = 0;
    const run = createResearchHandler({
      env,
      logDiagnostic: (event: GeminiDiagnosticEvent) => {
        if (throwingLogger) throw new Error("logger unavailable");
        events.push({ ...event });
      },
      fetcher: (() => {
        if (++calls === 1) {
          return Promise.resolve(json({ results: [sourceResult] }));
        }
        throw new TypeError("fixture-secret sensitive user content");
      }) as typeof fetch,
    });
    const response = await run(request());
    const body = await response.json();
    assert(
      response.status === 502 && body.code === "GEMINI_NETWORK" &&
        body.sources.length === 1,
    );
  }
  assert(
    events.length === 1 && events[0].stage === "api_request" &&
      events[0].httpStatus === null,
  );
  assert(!JSON.stringify(events).includes("fixture-secret"));
});

Deno.test("successful Gemini emits timing while Tavily-only failures emit no Gemini diagnostics", async () => {
  for (const researchFails of [false, true]) {
    let calls = 0;
    const events: GeminiDiagnosticEvent[] = [];
    const run = createResearchHandler({
      env,
      logDiagnostic: (event: GeminiDiagnosticEvent) => events.push(event),
      fetcher: (() =>
        Promise.resolve(
          ++calls === 1
            ? json({ results: [sourceResult] }, researchFails ? 500 : 200)
            : gemini(),
        )) as typeof fetch,
    });
    const response = await run(request());
    await response.body?.cancel();
    assert(response.status === (researchFails ? 502 : 200));
    assert(events.length === (researchFails ? 0 : 1));
    if (!researchFails) {
      assert(
        events[0].event === "gemini_success" && events[0].stage === "completed",
      );
      assert(events[0].failureCode === null && events[0].httpStatus === 200);
      assert(
        events[0].timeoutMs === 90000 && events[0].elapsedMs !== null &&
          events[0].elapsedMs >= 0,
      );
    }
  }
});

Deno.test("Gemini timeout environment configuration is bounded and defaults to 90 seconds", async () => {
  const cases: [string | undefined, number][] = [
    [undefined, 90000],
    ["", 90000],
    ["   ", 90000],
    ["invalid-secret", 90000],
    ["45000", 45000],
    [" 1000 ", 1000],
    ["120000", 120000],
    ["90000", 90000],
    ["0", 90000],
    ["-1", 90000],
    ["999", 90000],
    ["120001", 90000],
    ["Infinity", 90000],
    ["1.5", 90000],
    ["1e4", 90000],
  ];
  for (const [configured, expected] of cases) {
    let calls = 0;
    const events: GeminiDiagnosticEvent[] = [];
    const run = createResearchHandler({
      env: (name) => name === "GEMINI_TIMEOUT_MS" ? configured : env(name),
      logDiagnostic: (event) => events.push(event),
      fetcher: (() =>
        Promise.resolve(
          ++calls === 1 ? json({ results: [sourceResult] }) : gemini(),
        )) as typeof fetch,
    });
    const response = await run(request());
    const body = await response.json();
    assert(response.status === 200 && body.status === "completed");
    assert(
      events.length === 1 && events[0].timeoutMs === expected &&
        events[0].event === "gemini_success",
    );
    assert(
      events[0].elapsedMs !== null && Number.isInteger(events[0].elapsedMs) &&
        events[0].elapsedMs >= 0,
    );
    assert(!JSON.stringify(events).includes("invalid-secret"));
    assert(!("elapsedMs" in body) && !("timeoutMs" in body));
  }
});

Deno.test("default Gemini AbortController timer uses 90000 ms and clears after success", async () => {
  const originalSetTimeout = globalThis.setTimeout;
  const delays: number[] = [];
  globalThis.setTimeout = ((...args: Parameters<typeof setTimeout>) => {
    delays.push(args[1] ?? 0);
    return originalSetTimeout(...args);
  }) as typeof setTimeout;
  try {
    let calls = 0;
    const run = createResearchHandler({
      env,
      logDiagnostic: () => {},
      fetcher: (() =>
        Promise.resolve(
          ++calls === 1 ? json({ results: [sourceResult] }) : gemini(),
        )) as typeof fetch,
    });
    const response = await run(request());
    await response.body?.cancel();
    assert(response.status === 200);
    assert(delays.length === 2 && delays[0] === 15000 && delays[1] === 90000);
    // Deno's resource sanitizer also checks that these timers are cleared.
  } finally {
    globalThis.setTimeout = originalSetTimeout;
  }
});

Deno.test("Gemini timeout override aborts pending headers and emits elapsed time with preserved sources", async () => {
  let calls = 0;
  const events: GeminiDiagnosticEvent[] = [];
  let aborted = false;
  const run = createResearchHandler({
    env: (name) => name === "GEMINI_TIMEOUT_MS" ? "120000" : env(name),
    geminiTimeout: 5,
    logDiagnostic: (event) => events.push(event),
    fetcher: ((_url, init) => {
      if (++calls === 1) {
        return Promise.resolve(json({ results: [sourceResult] }));
      }
      return new Promise((_resolve, reject) =>
        init?.signal?.addEventListener("abort", () => {
          aborted = true;
          reject(new Error("fixture-secret private transport detail"));
        })
      );
    }) as typeof fetch,
  });
  const response = await run(request());
  const body = await response.json();
  assert(
    aborted && response.status === 504 && body.code === "GEMINI_TIMEOUT" &&
      body.sources.length === 1 && body.briefing === null,
  );
  assert(events.length === 1);
  const event = events[0];
  assert(
    event.event === "gemini_failure" && event.stage === "api_request" &&
      event.httpStatus === null,
  );
  assert(
    event.timeoutMs === 5 && event.elapsedMs !== null && event.elapsedMs >= 1 &&
      event.failureCode === "GEMINI_TIMEOUT",
  );
  assert(!JSON.stringify(events).includes("fixture-secret"));
});

Deno.test("Gemini deadline covers response body reading and retains the HTTP status", async () => {
  let calls = 0;
  const events: GeminiDiagnosticEvent[] = [];
  const run = createResearchHandler({
    env,
    geminiTimeout: 5,
    logDiagnostic: (event) => events.push(event),
    fetcher: ((_url, init) => {
      if (++calls === 1) {
        return Promise.resolve(json({ results: [sourceResult] }));
      }
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          init?.signal?.addEventListener(
            "abort",
            () => controller.error(new Error("private body")),
          );
        },
      });
      return Promise.resolve(new Response(stream, { status: 200 }));
    }) as typeof fetch,
  });
  const response = await run(request());
  const body = await response.json();
  assert(
    response.status === 504 && body.code === "GEMINI_TIMEOUT" &&
      body.sources.length === 1,
  );
  assert(
    events.length === 1 && events[0].httpStatus === 200 &&
      events[0].stage === "response_parsing",
  );
  assert(events[0].elapsedMs !== null && events[0].elapsedMs >= 1);
  assert(!JSON.stringify(events).includes("private body"));
});

Deno.test("success and provider error timing logs contain only allowlisted metadata", async () => {
  for (const fails of [false, true]) {
    let calls = 0;
    const events: GeminiDiagnosticEvent[] = [];
    const sensitiveSource = {
      ...sourceResult,
      content: "sensitive-research-content",
      title: "sensitive-source-title",
    };
    const generated = {
      ...valid(),
      executiveSummary: [{
        text: "sensitive-generated-output",
        kind: "fact",
        sourceIds: ["source-1"],
      }],
    };
    const run = createResearchHandler({
      env,
      logDiagnostic: (event) => events.push(event),
      fetcher: (() =>
        Promise.resolve(
          ++calls === 1 ? json({ results: [sensitiveSource] }) : fails
            ? json({
              error: {
                code: 429,
                status: "RESOURCE_EXHAUSTED",
                message:
                  "quota fixture-secret sensitive-target sensitive-research-content",
                details: { token: "private-token" },
              },
            }, 429)
            : gemini(generated),
        )) as typeof fetch,
    });
    const response = await run(
      request({ targetName: "sensitive-target", targetType: "company" }),
    );
    await response.body?.cancel();
    assert(response.status === (fails ? 429 : 200) && events.length === 1);
    const event = events[0];
    assert(
      event.elapsedMs !== null && event.elapsedMs >= 0 &&
        event.timeoutMs === 90000,
    );
    assert(event.event === (fails ? "gemini_failure" : "gemini_success"));
    if (fails) {
      assert(
        event.providerCode === 429 &&
          event.providerStatus === "RESOURCE_EXHAUSTED",
      );
    }
    const allowedKeys = [
      "event",
      "stage",
      "model",
      "httpStatus",
      "providerCode",
      "providerStatus",
      "providerMessage",
      "reason",
      "timeoutMs",
      "elapsedMs",
      "failureCode",
    ];
    assert(Object.keys(event).every((key) => allowedKeys.includes(key)));
    for (
      const sensitive of [
        "fixture-secret",
        "sensitive-target",
        sensitiveSource.content,
        sensitiveSource.title,
        "sensitive-generated-output",
        "private-token",
        "systemInstruction",
        "Authorization",
        "x-goog-api-key",
      ]
    ) assert(!JSON.stringify(event).includes(sensitive));
  }
});

Deno.test("a failing success logger cannot turn a completed briefing into a failure", async () => {
  let calls = 0;
  const run = createResearchHandler({
    env,
    logDiagnostic: () => {
      throw new Error("logger unavailable");
    },
    fetcher: (() =>
      Promise.resolve(
        ++calls === 1 ? json({ results: [sourceResult] }) : gemini(),
      )) as typeof fetch,
  });
  const response = await run(request());
  assert(
    response.status === 200 && (await response.json()).status === "completed",
  );
});
