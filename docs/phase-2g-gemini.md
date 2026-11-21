# Phase 2G: Tavily + Gemini integration



Local implementation only. Nothing has been deployed, committed, or pushed.



## Data flow and decisions



1. React reads the current Supabase session and invokes `research-briefing` with the user's access token, target name, and explicit company/person selection. Meeting scheduling metadata stays in the browser report.

2. The existing `withSupabase({ auth: ["user"] })` wrapper authenticates the caller before the handler runs.

3. Tavily keeps its existing basic search, five-result limit, and disabled raw content/answer settings. Results are normalized, HTTP(S) URLs checked, tracking parameters removed, and duplicates discarded. Source IDs remain stable within the report and through history persistence.

4. Gemini receives at most five excerpts of 2,400 characters each (plus bounded titles, URLs, and metadata). Credentials stay in server-side request headers. Retrieved content is isolated in user data; system instructions forbid following instructions found in source text.

5. Gemini's official generateContent API uses `responseMimeType: application/json` and `responseJsonSchema`. Default model: `gemini-3.8-flash`; optional server secret `GEMINI_MODEL` selects another supported Flash model. No AI SDK or other dependency was added.

6. Runtime validation checks all six sections, nonempty executive summary, exactly five distinct questions, field sizes, factual/analysis labels, and nonempty citation lists referencing actual sources. Opportunities and risks are labeled analysis. Blocked, truncated, malformed, or invalid responses fail instead of becoming completed briefings.

7. React displays all six sections with links to the original research. Unsupported sections are explicitly empty. Failed AI generation keeps Tavily sources in the non-2xx response; the frontend reads the Supabase Functions error response and displays them with the failure.

8. Explicit Save persists the live report in the existing `report` JSONB field and source rows using the user's client and existing RLS. Existing demo snapshots continue using their original renderer and demo labels. No schema changes or privileged operations were needed.



Timeouts: Tavily 15 seconds, Gemini 90 seconds by default (configurable with server-side `GEMINI_TIMEOUT_MS`, 1,000?120,000 ms), including response-body reading. Input bodies are capped at 4 KiB and names at 120 characters. No raw provider errors or credentials are logged or displayed.



Citation validation verifies reference integrity, not whether every claim is semantically entailed by its source. The prompt requires source-grounded claims, and users should review linked evidence. Search results are not guaranteed to be from the past 30 days; the UI no longer makes that promise. Unsupported model access or quota must be checked with a real authenticated call after deployment.



## Local checks



Run from `D:\Downloads\BriefMeet AI`:



```powershell

deno check --config supabase/functions/deno.json supabase/functions/research-briefing/index.ts

deno test --config supabase/functions/deno.json --allow-env supabase/functions/research-briefing/pipeline_test.ts

node --test tests/*.test.js

npm.cmd run build

```



Verification results: Deno check passed; 27 backend tests passed; 13 frontend/history tests passed; production build passed; git diff whitespace check passed. No final check errors. Warnings: PowerShell script policy required npm.cmd; Git reports automatic LF-to-CRLF conversion notices for several files. No Vite build warnings.



The tests make no live provider calls and use fixture keys. Backend tests include actual Supabase wrapper authentication with local signed JWTs; frontend tests include rendered React markup, error sources, and HTML escaping; history tests cover live and legacy demo persistence. These do not verify deployed RLS, browser layout, or live API credentials.



PowerShell blocks `npm.ps1` under the current execution policy. `npm.cmd` runs the same npm build without changing that policy.



## Deployment steps — only after approval



1. Confirm the existing project's Supabase secrets include `TAVILY_API_KEY` and `GEMINI_API_KEY`. Optionally set `GEMINI_MODEL` in the dashboard. Never put these in Vite environment variables.

2. Use your installed Supabase CLI. It was not available on PATH in this environment. Check its version and help before deployment because current v3 uses `--remote`, while older v2 uses `--project-ref`:



```powershell

Set-Location 'D:\Downloads\BriefMeet AI'

supabase --version

supabase --help

supabase login --help

supabase functions --help

supabase functions deploy --help

supabase login

```



3. After login, replace the placeholder with your existing project's reference and run the command matching your CLI version:



```powershell

# Current CLI v3:

supabase functions deploy research-briefing --remote=YOUR_PROJECT_REF --use-api



# CLI v2, if deploy --help lists --project-ref instead:

supabase functions deploy research-briefing --project-ref YOUR_PROJECT_REF --use-api

```



Deploy only this function, including its imported `pipeline.ts`. Leave the existing user-auth configuration intact; do not add `--no-verify-jwt`. No database migration is required. This command updates the Edge Function only; the changed frontend requires your usual frontend release process separately.



## Test with a real authenticated user



After the approved function deployment:



1. Confirm the existing frontend Supabase URL and publishable key point to the same project. No provider key belongs in frontend configuration.

2. Run `npm.cmd run dev`, open the displayed local URL, and sign in with an existing Supabase user.

3. Choose company or person, enter a specific name and meeting schedule, and generate a briefing. Alternatively use the development-only **Test Live Research + Gemini** button for Microsoft without saving history.

4. Verify six sections, exactly five suggested questions, factual/analysis labels, and clickable citations. An unsupported section should state that supporting research is insufficient.

5. Choose **Save briefing**, refresh, and reopen it from history. Confirm the complete report and source links persist. Existing saved demos should still be labeled demos.

6. Sign out and verify the dashboard requires authentication. The offline tests additionally verify that missing credentials, malformed bearer tokens, and a publishable key alone cannot enter the handler.

7. For controlled failure testing use the offline suites; they cover Gemini quota/timeouts/service errors/network failures, invalid JSON and citations, Tavily failures and empty results. Avoid intentionally consuming live quota or editing production secrets merely to induce failures.



## File inventory



Created:

- `supabase/functions/research-briefing/pipeline.ts`: typed pipeline, provider calls, schema, validation.

- `supabase/functions/research-briefing/pipeline_test.ts`: backend and auth tests.

- `src/services/researchClient.js`: authenticated request, response handling, safe source mapping.

- `src/components/GeneratedBriefing.jsx`: live six-section briefing and research-source rendering.

- `tests/researchClient.test.js`: client and React-rendering tests.

- `docs/phase-2g-gemini.md`: this implementation and deployment guide.



Modified:

- `supabase/functions/research-briefing/index.ts`: retained auth wrapper delegates to testable pipeline.

- `src/services/briefingService.js`: replaces mock generation with the authenticated live client.

- `src/services/briefingDatabase.js`: saves live reports without forcing mock labels; retains saveDemo compatibility.

- `src/App.jsx`: live generation/rendering, failure sources, history save wiring.

- `src/components/LiveResearchTest.jsx`: tests complete research and AI pipeline.

- `src/components/BriefingForm.jsx`, `BriefingHistory.jsx`, `BriefingProgress.jsx`, `EmptyState.jsx`, `ErrorMessage.jsx`, `Header.jsx`: accurate live-research copy/states; development-only error toggle.

- `tests/briefingDatabase.test.js`: live history round-trip coverage.



## Official references



- [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output)

- [Gemini Flash model](https://aistudio.google.com/docs/models/gemini-3.8-flash)

- [Supabase Edge Function authentication](https://supabase.com/docs/guides/functions/auth)

- [Supabase CLI deployment](https://supabase.com/docs/reference/cli/supabase-functions-deploy)


## Model configuration verification — November 10, 2026

Google's official supported-model documentation lists the exact ID `gemini-3.8-flash` for the Gemini Developer API. The default remains unchanged. `GEMINI_MODEL` remains a server-side environment override, trimmed before use; unset or blank values select the default. A regression test covers a nonblank override and blank-value fallback. No provider credentials were read or used for this verification, and project-specific model access/quota has not been tested with a live API request.

References:
- https://firebase.google.com/docs/ai-logic/models?api=dev
- https://aistudio.google.com/docs/models/gemini-3.8-flash


Reverification results: Deno check passed; 27 backend tests passed (including model override/fallback); 13 frontend/history tests passed; production build passed. No application runtime code changed during model verification.
