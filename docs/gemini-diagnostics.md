# Investigating Gemini failures

The public HTTP 502 is a pipeline response, not necessarily Gemini's HTTP status.
Previously, non-2xx Gemini response bodies were discarded. Invalid provider JSON,
blocked/truncated completions, invalid generated JSON, and schema/citation
validation failures could also produce HTTP 502. The source of the live failure
cannot be confirmed from the public status alone.

The model selection, request schema, generation settings, authentication, public
errors and Tavily source preservation remain unchanged. No model or secret was
changed while adding diagnostics.

## Diagnostic fields

Each attempted Gemini operation emits one server-side JSON event: `gemini_success` after a validated briefing, or `gemini_failure` on error. Successful events use info level; failures use error level.

```json
{
  "event": "gemini_failure",
  "stage": "api_request",
  "model": "gemini-3.8-flash",
  "httpStatus": 400,
  "providerCode": 400,
  "providerStatus": "INVALID_ARGUMENT",
  "providerMessage": "Provider rejected the structured-output schema (message summarized for privacy).",
  "reason": "provider_request_failed",
  "timeoutMs": 90000,
  "elapsedMs": 245,
  "failureCode": "GEMINI_UNAVAILABLE"
}
```

This example is illustrative, not evidence of the actual production error.

- `api_request`: Gemini returned a non-2xx response, or the request failed or timed out.
- `response_parsing`: Gemini returned HTTP success, but the envelope, completion,
  or generated JSON could not be accepted. Reasons distinguish invalid provider
  JSON, missing/blocked candidates, output token limit, safety block, incomplete
  candidate, and invalid briefing JSON.
- `briefing_validation`: the generated JSON failed the existing schema or citation checks.

`httpStatus` is null when no response was received. Provider fields are null when
absent, malformed, or unavailable. Only numeric HTTP-range provider codes and
known Google status names are recorded. Error envelopes are capped at 8 KiB and
read under the existing request timeout. Unrecognized provider free-text
messages are suppressed; recognized messages are summarized using fixed text,
except for one known static invalid-key message. This prevents upstream errors
from echoing user input or credentials into logs. Full error bodies, details,
prompts, model output, request URLs/headers, user identifiers, target names,
research sources, and exception strings are never logged.

Diagnostics do not appear in frontend responses. Logger failures do not replace
the original public error or discard sources. Successful events use `stage: completed`,
`reason: briefing_completed` and `failureCode: null`. No Gemini event is emitted
for Tavily-only failures.

## Reproduce and inspect

These changes exist locally only. Existing deployed code cannot emit these new
events until an updated function is deployed separately with approval.

1. Run the offline backend suite to reproduce provider HTTP failures, invalid
   JSON, truncation, citation validation, network errors, and privacy checks:

   ```powershell
   deno test --config supabase/functions/deno.json --allow-env supabase/functions/research-briefing/pipeline_test.ts
   ```

   Existing failure fixtures print sanitized events in the terminal; dedicated
   tests also capture and assert diagnostic fields without making provider calls.

2. After a separately approved deployment of this revision, open the React app,
   sign in with a real Supabase user, and run Microsoft/company research using
   the main form or development-only live test button. Note the time of failure.
   Verify the friendly error and available sources still appear.
3. In Supabase Dashboard, open **Edge Functions → research-briefing → Logs**.
   Search for `gemini_failure` or `gemini_success` near that timestamp. The **Invocations** view shows
   the public request's status (504 for a Gemini timeout); **Logs** contains the diagnostic event. Use the
   execution metadata to distinguish concurrent invocations.
4. Check the stage first, then Gemini HTTP status, provider status/message and
   failure reason. An HTTP 404/model-unavailable message suggests checking model
   availability; HTTP 400/invalid-argument suggests the request or schema;
   HTTP 403 suggests access restrictions; HTTP 429 suggests quota; HTTP 200 with
   parsing/validation stages points to completion handling rather than provider
   HTTP failure. These are investigation leads, not automatic configuration fixes.

Do not change secrets or disable authentication to induce errors. Review only the
sanitized event when sharing diagnostics; do not share request headers, tokens,
provider keys or complete invocation payloads.

Official reference: [Supabase Edge Function logging](https://supabase.com/docs/guides/functions/logging).

## Timeout and elapsed time configuration

The default Gemini request deadline is now **90,000 ms**. The server reads the
optional `GEMINI_TIMEOUT_MS` environment variable on each Gemini request. It
accepts a whole-number string between **1,000 and 120,000 ms**, inclusive (outer
whitespace is ignored). Unset, blank, fractional, nonnumeric, negative, zero or
out-of-range values fall back to 90,000 ms. Raw environment values are never logged.
No Supabase secret or environment value was changed by this local patch.

The existing injected `geminiTimeout` option takes precedence over the environment
value so offline tests can use short deadlines without waiting 90 seconds.
Tavily's deadline remains 15,000 ms. The environment cap reserves headroom for
Tavily and response handling under the hosted request limit.

`timeoutMs` is the applied Gemini deadline. `elapsedMs` uses the monotonic
`performance.now()` clock and measures the provider request through body reading
or failure. It excludes Tavily and subsequent briefing validation. Fast fixture
responses may round to zero. The AbortController timer remains active during body
reading and is cleared on every outcome. A no-headers timeout has
`httpStatus: null`; a body-reading timeout retains the received HTTP status.

The same allowlisted metadata is logged on success, without including the
briefing. Existing provider-message privacy rules apply to failure logs. Log
sink failures cannot affect either successful or failed API responses.

Local verification: Deno lint and both entry-point type checks passed; 27 backend
tests and 13 frontend/history tests passed; production build passed. New tests
cover default/valid/invalid timeout settings, the actual 90-second timer value,
header/body cancellation, elapsed-time logging, logger failure, and privacy.
A longer deadline does not establish or fix the underlying cause of live
provider/network delays; the next real authenticated test requires a separately
approved deployment.
