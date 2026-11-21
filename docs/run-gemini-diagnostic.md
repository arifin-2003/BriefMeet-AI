# Run the standalone Gemini diagnostic

This script does not use or modify Supabase, Tavily, the database or the production
pipeline. With `--list-only`, it makes only model-metadata calls. Without that
flag it also makes **one potentially billable generation request** with the
synthetic prompt `Reply with exactly OK.` It has no retries,
fallback model, SDK dependency, or automatic environment-file loading.

It was tested with mocked responses only. No live API key was accessed during
preparation. Use the same original key you configured in Supabase, from your
trusted credential store. Do not paste a key into chat, source files or a command
line. Supabase's secret listing does not reveal the original secret value.

## List models without generation

Enter the original key at the hidden prompt; never paste it into a command.
This does not alter Supabase secrets or make a generation request:

```powershell
Set-Location 'D:\Downloads\BriefMeet AI'
$geminiDiagnosticSecret = Read-Host 'Enter the existing Gemini API key (hidden)' -AsSecureString
try {
    $env:GEMINI_API_KEY = [System.Net.NetworkCredential]::new('', $geminiDiagnosticSecret).Password
    deno run --no-config --no-prompt --allow-env=GEMINI_API_KEY,GEMINI_MODEL,GEMINI_TIMEOUT_MS --allow-net=generativelanguage.googleapis.com:443 scripts/gemini-diagnostic.ts --list-only
} finally {
    Remove-Item Env:GEMINI_API_KEY -ErrorAction SilentlyContinue
    $geminiDiagnosticSecret.Dispose()
    Remove-Variable geminiDiagnosticSecret -ErrorAction SilentlyContinue
}
```

Inspect `models_list` and `listingComplete`. Model metadata does not guarantee
generation access or structured-output compatibility. Control characters in the
trimmed key stop the diagnostic before any request; re-enter the original key
from a trusted source. Header validation by itself does not verify credentials.

## PowerShell: key already supplied securely to this terminal

From the project directory, run:

```powershell
Set-Location 'D:\Downloads\BriefMeet AI'
deno run --no-config --no-prompt --allow-env=GEMINI_API_KEY,GEMINI_MODEL,GEMINI_TIMEOUT_MS --allow-net=generativelanguage.googleapis.com:443 scripts/gemini-diagnostic.ts
```

The script has permission to read only these three environment variables and
connect only to Google's API host. It has no filesystem-write permission. It
refuses redirects so the key cannot be forwarded to a different host.

## PowerShell: supply the key using a hidden prompt

If the key is not already present in this terminal, use this block. The entered
key is hidden, is not part of shell history, and is removed from the process
environment after the script finishes. No key file is created.

```powershell
Set-Location 'D:\Downloads\BriefMeet AI'
$geminiDiagnosticSecret = Read-Host 'Enter the existing Gemini API key (hidden)' -AsSecureString
try {
    $env:GEMINI_API_KEY = [System.Net.NetworkCredential]::new('', $geminiDiagnosticSecret).Password
    deno run --no-config --no-prompt --allow-env=GEMINI_API_KEY,GEMINI_MODEL,GEMINI_TIMEOUT_MS --allow-net=generativelanguage.googleapis.com:443 scripts/gemini-diagnostic.ts
} finally {
    Remove-Item Env:GEMINI_API_KEY -ErrorAction SilentlyContinue
    $geminiDiagnosticSecret.Dispose()
    Remove-Variable geminiDiagnosticSecret -ErrorAction SilentlyContinue
}
```

`GEMINI_MODEL` defaults to `gemini-3.8-flash`. If production uses a different
explicit `GEMINI_MODEL`, set the same non-secret value in this terminal before
running. The script does not retrieve production configuration automatically.
It reports the actual selected model in its output. Model overrides affect only
the diagnostic process; they do not change Supabase or introduce a fallback.

The generation deadline defaults to 90,000 ms. Optional `GEMINI_TIMEOUT_MS`
matches the production parser: integer 1,000–120,000 ms, otherwise 90,000 ms.
Metadata calls have a maximum 15-second deadline each. Pagination stops after
20 pages or on failure; incomplete listing is reported explicitly.

## Output and what to share

Output consists of safe JSON lines:

- `request_preflight`: native header construction result (`headerValid`) without
  any header values. If false, no metadata or generation requests are sent.
  A true result validates header syntax only, not API-key correctness.

- `models_page`: metadata request HTTP status, elapsed milliseconds and a fixed
  error summary for each page. No page tokens or request URLs are printed.
- `models_list`: names supporting `generateContent`, `listingComplete`,
  `configuredModelListed`, and `baselineModelListed` for `gemini-3.8-flash`.
  A null listed flag means availability is unknown because listing was incomplete
  (unless that model was already found). False means absent from a complete list.
- `minimal_prompt`: selected model, HTTP status, elapsed milliseconds, applied
  timeout, `generationSucceeded`, `replyMatchedOK`, and a fixed safe summary.
  Generated content and provider error bodies are never printed.

Share **only these JSON lines**, especially `request_preflight`, `models_list`, `minimal_prompt`, and
any failing `models_page` line, plus approximately when you ran the test and
whether it ran on your local PC. Do not share keys, environment-variable dumps,
headers, shell transcripts containing other commands, or raw provider responses.

Interpretation:

- Metadata listing succeeds but generation returns 503: listing does not prove
  inference availability or project eligibility; the tiny prompt also failed.
- Minimal generation succeeds while the deployed briefing fails: compare runtime,
  timing, project configuration, and then schema/prompt complexity. Local success
  does not establish availability from the Supabase runtime.
- `generationSucceeded: true` but `replyMatchedOK: false`: generation returned a
  complete text answer with different content; share the flags, not the answer.
- HTTP 401/403: check existing key/project permissions without changing secrets.
- HTTP 404: check the selected model and supported method metadata.
- HTTP 429: quota/rate limit; HTTP 503: provider unavailable; null status: no HTTP
  response was received (connection failure or the configured deadline expired).
- Model-list success alone never proves billing eligibility or generation access.

Exit code is 0 when listing completes and a complete generated answer is returned;
otherwise it is 1. The individual JSON fields distinguish partial success.

## Offline verification

These commands do not read credentials or make network calls:

```powershell
deno lint --no-config scripts/gemini-diagnostic.ts scripts/gemini-diagnostic_test.ts
deno check --no-config scripts/gemini-diagnostic.ts scripts/gemini-diagnostic_test.ts
deno test --no-config scripts/gemini-diagnostic_test.ts
```

Tests cover pagination/filtering, protected key headers, prompt shape, HTTP 503,
missing credentials, configured-model selection without fallback, incomplete
listing, timeout cancellation, and omission of private provider/generated text.

The production retry mechanism and model selection remain unchanged. Any retry
patch, model change or deployment requires separate approval.

## Safe local failure classification

Each `models_page` and `minimal_prompt` line now includes:

- `headerValid`: true after successful local `Headers` construction.
- `signalAborted`: whether this request's AbortController signal was aborted.
- `timeoutMs`: the applied deadline for this particular request.
- `errorCategory`: an allowlisted exception name such as `NotCapable`,
  `PermissionDenied`, `TypeError`, or `SyntaxError`; `Timeout` when the request's
  deadline fired; `Unknown` for unrecognized exceptions. Null means no exception
  was caught; an HTTP error such as 403 or 503 is reported through `httpStatus`.
- `errorCode`: an allowlisted low-level code (for example `ENOTFOUND`,
  `ECONNREFUSED`, `ECONNRESET`, `ETIMEDOUT` or a recognized certificate error).
  Codes can be recognized in a bounded exception cause chain. Unrecognized codes
  are null, never copied verbatim.

Invalid-header preflight reports only the same safe categories/codes and a fixed
summary. Top-level `diagnostic_error` records can have null `headerValid` and
`signalAborted` when request state is unknown.

No raw exception message, stack, cause object, request header, key, proxy address,
credential-bearing URL, response body or generated content is printed. The
script does not read additional proxy/environment variables or broaden network
permissions. `--no-prompt` prevents interactive permission prompts; denied
permissions surface through the safe error handling instead. `redirect: error`
remains enabled, so no redirect can forward the key to another host.

Interpret the fields together:

- `headerValid: false`: request construction failed locally. Re-enter the existing
  key using the hidden prompt, without quotes or embedded line breaks; never
  share its value. Do not rotate the key based on header validation alone.
- `NotCapable` or `PermissionDenied`: check the precise command and restrictions;
  do not switch to unrestricted network access.
- `TypeError` with valid headers: may be a transport/TLS/redirect failure; it does
  not by itself establish which one. A recognized cause code may narrow it down.
- `signalAborted: true` and `Timeout`: the request deadline fired.
- `SyntaxError` with HTTP 200: the response could not be parsed as JSON.

Offline verification after this patch: formatting, lint, and type checks passed;
**11 tests passed**, including real native header rejection for Unicode quotes,
embedded newlines and NUL, simulated permission/cause-code errors, timeout state,
and unchanged redirect protection. No live or billable requests were made.

## Request stages and nested causes

The diagnostic now constructs a complete native `Request` before passing that
object to `fetch`. It does not follow redirects or change timeout settings.
Each `models_page` and `minimal_prompt` record includes the last reached `stage`:

- `request_construction`: creating the full URL/method/body/header/signal Request
  failed before fetch was called.
- `fetch_execution`: the complete Request was constructed, but fetch threw before
  returning an HTTP Response.
- `response_read`: fetch returned a Response and a failure occurred while reading,
  cancelling or parsing its body. Normal HTTP results also finish at this stage;
  consult `httpStatus` and `errorCategory` to distinguish an HTTP error from a
  thrown exception.

A failing Headers preflight is also marked `request_construction`, but
`headerValid: false` distinguishes it from failure of full Request construction.
A successful Headers preflight does not by itself prove full Request construction.

`errorChain` contains up to five root/cause entries. Each entry contains only an
allowlisted `name` (otherwise `Unknown`) and allowlisted `code` (otherwise null).
Cycles are detected. Names, messages, stacks, arbitrary cause objects, URLs and
headers are never copied verbatim. The existing `errorCode` remains the first
recognized code found in that bounded chain. An empty chain means no exception
was caught; a chain with one TypeError and null code means the runtime supplied
no further recognized cause information. The tool does not invent an explanation
when these fields are inconclusive.

`request_preflight.keyFormatting` reports only these booleans:

- `outerWhitespaceTrimmed`: the existing trim operation removed outer whitespace.
- `containsWhitespace`: whitespace remains inside the trimmed value.
- `containsNonAscii`: the trimmed value contains a non-ASCII character.
- `containsControlCharacters`: the trimmed value contains an ASCII control or DEL.
- `hasSurroundingQuote`: the trimmed value starts or ends with a single/double quote.

No length, prefix, suffix, character value, hash or key content is reported. These
flags describe formatting only; none prove that a key is authorized. No additional
normalization beyond the pre-existing outer trim was added.

Share the safe `request_preflight` record and failing per-request records, including
`stage`, `errorChain`, `errorCode`, `headerValid` and `signalAborted`. Do not share
raw exceptions or the key. The restricted PowerShell command above is unchanged.

Latest offline verification: formatting, lint and type checks passed, and **15
regression tests passed**. Tests include complete Request construction failure,
fetch rejection, response parsing failure, bounded/cyclic cause chains, and key
formatting flags. All HTTP calls were mocked; no live API requests were made.
