// Standalone diagnostic: no production imports, dependencies, retries or fallback.
type Output = Record<string, unknown>;
type Options = {
  env?: (name: string) => string | undefined;
  fetcher?: typeof fetch;
  write?: (value: Output) => void;
  timeoutMs?: number;
  listOnly?: boolean;
};
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const endpoint = "https://generativelanguage.googleapis.com/v1beta/";
const baselineModel = "gemini-3.8-flash";

// Names/codes are allowlisted, not copied from arbitrary exception text.
function safeError(error: unknown, aborted = false) {
  const categories = [
    "NotCapable",
    "PermissionDenied",
    "TypeError",
    "AbortError",
    "TimedOut",
    "ConnectionRefused",
    "ConnectionReset",
    "ConnectionAborted",
    "NotFound",
    "Http",
    "InvalidData",
    "SyntaxError",
    "Error",
  ];
  const codes = [
    "ECONNREFUSED",
    "ECONNRESET",
    "ECONNABORTED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "EAI_AGAIN",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "EACCES",
    "EPERM",
    "CERT_HAS_EXPIRED",
    "DEPTH_ZERO_SELF_SIGNED_CERT",
    "SELF_SIGNED_CERT_IN_CHAIN",
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    "ERR_TLS_CERT_ALTNAME_INVALID",
    "ERR_INVALID_HTTP_TOKEN",
    "ERR_INVALID_CHAR",
  ];
  const name = object(error) ? error.name : undefined;
  let errorCode: string | null = null;
  const errorChain: { name: string; code: string | null }[] = [];
  const visited = new Set<unknown>();
  let current = error;
  // Some runtimes wrap a low-level code in cause. Never serialize that object.
  for (
    let depth = 0;
    depth < 5 && object(current) && !visited.has(current);
    depth++
  ) {
    visited.add(current);
    const code =
      typeof current.code === "string" && codes.includes(current.code)
        ? current.code
        : null;
    errorChain.push({
      name:
        typeof current.name === "string" && categories.includes(current.name)
          ? current.name
          : "Unknown",
      code,
    });
    if (errorCode === null && code !== null) errorCode = code;
    current = current.cause;
  }
  return {
    errorCategory: aborted
      ? "Timeout"
      : typeof name === "string" && categories.includes(name)
      ? name
      : "Unknown",
    errorCode,
    errorChain,
  };
}

function errorSummary(status: number): string {
  if (status === 400) return "Provider rejected the request.";
  if (status === 401 || status === 403) {
    return "Provider rejected authentication or project access.";
  }
  if (status === 404) return "Model or API method was not found.";
  if (status === 429) return "Provider quota or rate limit reached.";
  if (status === 503) return "Provider temporarily unavailable (HTTP 503).";
  return "Provider returned an HTTP error; raw details omitted.";
}

export async function runDiagnostic({
  env = (name) => Deno.env.get(name),
  fetcher = fetch,
  write = (value) => console.log(JSON.stringify(value)),
  timeoutMs,
  listOnly = false,
}: Options = {}): Promise<boolean> {
  const suppliedKey = env("GEMINI_API_KEY");
  const key = suppliedKey?.trim();
  if (!key) {
    write({
      event: "configuration_error",
      summary:
        "GEMINI_API_KEY is missing. Supply it through a protected environment variable.",
    });
    return false;
  }
  const model = env("GEMINI_MODEL")?.trim() || baselineModel;
  if (
    !/^gemini-[a-z0-9.-]*flash[a-z0-9.-]*$/.test(model) || model.length > 128 ||
    model.includes(key)
  ) {
    write({
      event: "configuration_error",
      summary: "GEMINI_MODEL is invalid; its value is not displayed.",
    });
    return false;
  }
  const configuredTimeout = env("GEMINI_TIMEOUT_MS")?.trim() ?? "";
  const parsedTimeout = /^\d+$/.test(configuredTimeout)
    ? Number(configuredTimeout)
    : 0;
  const requestTimeout = timeoutMs ??
    (Number.isSafeInteger(parsedTimeout) && parsedTimeout >= 1000 &&
        parsedTimeout <= 120000
      ? parsedTimeout
      : 90000);
  const keyFormatting = {
    outerWhitespaceTrimmed: suppliedKey !== key,
    containsWhitespace: /\s/.test(key),
    containsNonAscii: Array.from(key).some((character) =>
      character.charCodeAt(0) > 127
    ),
    containsControlCharacters: Array.from(key).some((character) =>
      character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127
    ),
    hasSurroundingQuote: /^["']|["']$/.test(key),
  };

  let headers: Headers;
  try {
    // Run native header validation before any network activity. Never log values.
    headers = new Headers({
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    });
  } catch (error) {
    write({
      event: "request_preflight",
      stage: "request_construction",
      keyFormatting,
      headerValid: false,
      signalAborted: false,
      ...safeError(error),
      summary: "Header construction failed locally; no requests were sent.",
    });
    return false;
  }
  if (keyFormatting.containsControlCharacters) {
    write({
      event: "request_preflight",
      keyFormatting,
      headerValid: true,
      signalAborted: false,
      errorCategory: null,
      errorCode: null,
      errorChain: [],
      summary: "Key contains control characters; no requests were sent. Re-enter the original key without changing it.",
    });
    return false;
  }
  write({
    event: "request_preflight",
    keyFormatting,
    headerValid: true,
    signalAborted: false,
    errorCategory: null,
    errorCode: null,
    errorChain: [],
    summary: "Header construction succeeded; values omitted.",
  });

  async function call(path: string, init: RequestInit, deadline: number) {
    const started = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), deadline);
    let httpStatus: number | null = null;
    let stage: "request_construction" | "fetch_execution" | "response_read" =
      "request_construction";
    const telemetry = () => ({
      stage,
      headerValid: true,
      signalAborted: controller.signal.aborted,
      timeoutMs: deadline,
      errorCategory: null,
      errorCode: null,
      errorChain: [] as { name: string; code: string | null }[],
    });
    try {
      const request = new Request(endpoint + path, {
        ...init,
        redirect: "error",
        signal: controller.signal,
        headers,
      });
      stage = "fetch_execution";
      const response = await fetcher(request);
      httpStatus = response.status;
      stage = "response_read";
      if (!response.ok) {
        await response.body?.cancel();
        return {
          ...telemetry(),
          httpStatus,
          elapsedMs: Math.round(performance.now() - started),
          summary: errorSummary(httpStatus),
          data: null,
        };
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error();
      let raw = "";
      let size = 0;
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > 1024 * 1024) {
            await reader.cancel();
            throw new Error();
          }
          raw += decoder.decode(value, { stream: true });
        }
        raw += decoder.decode();
      } finally {
        reader.releaseLock();
      }
      const data: unknown = JSON.parse(raw);
      return {
        ...telemetry(),
        httpStatus,
        elapsedMs: Math.round(performance.now() - started),
        summary: "HTTP request succeeded.",
        data,
      };
    } catch (error) {
      return {
        ...telemetry(),
        ...safeError(error, controller.signal.aborted),
        httpStatus,
        elapsedMs: Math.round(performance.now() - started),
        summary: controller.signal.aborted
          ? "Request timed out."
          : httpStatus === null
          ? "Request failed before an HTTP response; inspect the safe error category/code."
          : "Response could not be read as bounded JSON.",
        data: null,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  const names = new Set<string>();
  let pageToken = "";
  let listingComplete = false;
  for (let page = 1; page <= 20; page++) {
    const query = new URLSearchParams({ pageSize: "1000" });
    if (pageToken) query.set("pageToken", pageToken);
    const result = await call(
      `models?${query}`,
      { method: "GET" },
      Math.min(requestTimeout, 15000),
    );
    write({
      event: "models_page",
      model,
      page,
      httpStatus: result.httpStatus,
      stage: result.stage,
      errorChain: result.errorChain,
      elapsedMs: result.elapsedMs,
      headerValid: result.headerValid,
      signalAborted: result.signalAborted,
      errorCategory: result.errorCategory,
      errorCode: result.errorCode,
      timeoutMs: result.timeoutMs,
      summary: result.summary,
    });
    if (!object(result.data) || !Array.isArray(result.data.models)) break;
    for (const item of result.data.models) {
      if (
        object(item) && typeof item.name === "string" &&
        /^models\/[a-z0-9][a-z0-9._-]{0,150}$/.test(item.name) &&
        !item.name.includes(key) &&
        Array.isArray(item.supportedGenerationMethods) &&
        item.supportedGenerationMethods.includes("generateContent")
      ) {
        names.add(item.name.slice("models/".length));
      }
    }
    if (
      result.data.nextPageToken === undefined ||
      result.data.nextPageToken === ""
    ) {
      listingComplete = true;
      break;
    }
    if (
      typeof result.data.nextPageToken !== "string" ||
      result.data.nextPageToken.length > 4096 ||
      result.data.nextPageToken === pageToken
    ) break;
    pageToken = result.data.nextPageToken;
  }
  const listed = (name: string) =>
    names.has(name) ? true : listingComplete ? false : null;
  write({
    event: "models_list",
    model,
    generateContentModels: [...names].sort(),
    listingComplete,
    configuredModelListed: listed(model),
    baselineModel,
    baselineModelListed: listed(baselineModel),
    summary:
      "Listing metadata does not guarantee generation access, billing eligibility or current capacity.",
  });

  if (listOnly) return listingComplete;

  // Test the selected model even if listing failed; do not try other models.
  const result = await call(`models/${model}:generateContent`, {
    method: "POST",
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Reply with exactly OK." }] }],
    }),
  }, requestTimeout);
  const candidates =
    object(result.data) && Array.isArray(result.data.candidates)
      ? result.data.candidates
      : [];
  const candidate = candidates[0];
  const parts = object(candidate) && object(candidate.content) &&
      Array.isArray(candidate.content.parts)
    ? candidate.content.parts
    : [];
  const reply = parts.filter((p) => object(p) && !p.thought).map((p) =>
    object(p) && typeof p.text === "string" ? p.text : ""
  ).join("").trim();
  const complete = object(candidate) && candidate.finishReason === "STOP" &&
    reply.length > 0;
  write({
    event: "minimal_prompt",
    model,
    timeoutMs: requestTimeout,
    httpStatus: result.httpStatus,
    stage: result.stage,
    errorChain: result.errorChain,
    elapsedMs: result.elapsedMs,
    headerValid: result.headerValid,
    signalAborted: result.signalAborted,
    errorCategory: result.errorCategory,
    errorCode: result.errorCode,
    generationSucceeded: complete,
    replyMatchedOK: complete && reply === "OK",
    summary: complete
      ? "Generation completed; response content omitted."
      : result.httpStatus === 200 && result.data !== null
      ? "HTTP succeeded but no complete text answer was returned; content omitted."
      : result.summary,
  });
  return listingComplete && complete;
}

if (import.meta.main) {
  try {
    if (Deno.args.some((arg) => arg !== "--list-only")) {
      console.error("Usage: deno run ... scripts/gemini-diagnostic.ts [--list-only]");
      Deno.exitCode = 1;
    } else {
      Deno.exitCode = await runDiagnostic({ listOnly: Deno.args.includes("--list-only") }) ? 0 : 1;
    }
  } catch (error) {
    // Never print exception objects, request URLs, environment values or headers.
    console.error(
      JSON.stringify({
        event: "diagnostic_error",
        ...safeError(error),
        headerValid: null,
        signalAborted: null,
        summary:
          "Diagnostic could not complete; private exception details omitted.",
      }),
    );
    Deno.exitCode = 1;
  }
}
