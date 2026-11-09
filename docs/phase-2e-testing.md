# Phase 2E database integration

The checked-in migration defines `briefings` with UUID `id`, required `user_id`
(FK to `auth.users`), `target_type` (`company`/`person`), `target_name`,
`meeting_date`, optional `meeting_time`/`meeting_goal`, `status`
(`pending`/`processing`/`completed`/`failed`), JSONB `report`, and timestamps.
`briefing_sources` has UUID `id`, required `briefing_id` (cascade-delete FK),
`title`, `url`, optional `publisher`/`published_at`, and `created_at`.
RLS restricts briefing CRUD to `auth.uid() = user_id` and source CRUD to the owner
of the parent briefing. Anonymous table access is revoked in the migration.
This confirms the repository schema, not the deployed database state.

History now reads database records only. Existing localStorage demo history is
neither removed nor automatically uploaded. The demo generator remains local.
Saving is explicit; `completed` means a stored demo snapshot, not verified research.
Reports persist `isDemo: true`, `researchMode: 'mock'`, and `verified: false`.
Original citation IDs and reference numbers remain in JSONB, alongside UUID source
mappings. Source rows are fetched when reopening a saved report.

Report and source writes are separate requests, not a transaction. Stable UUIDs
and insert-only conflict handling allow retries without overwriting reports or
duplicating sources. A source failure leaves the report available, shows a warning,
and supports retry immediately or after reopening. A lost response can leave an
uncertain save/delete result; refresh history before repeating the operation.
History uses Supabase's configured API row limit; pagination is not implemented.

## Automated checks

```powershell
node --test tests/briefingDatabase.test.js
npm.cmd run build
git diff --check
```

The tests use the real supabase-js HTTP query builder against an in-memory fixture.
They cover persisted field mapping, save/reload/reopen/delete, citation integrity,
partial source failure and retry, account filters, missing sessions, denied
permissions, network recovery, null source dates, and empty sources. They never
contact the live database. Fixture isolation does **not** prove deployed RLS.
No lint script is configured in package.json.

## Manual browser and database verification

1. Run `npm.cmd run dev` and open `http://localhost:3000`. Sign in as test user A.
   Confirm existing theme switching and responsive navigation still work.
2. Select a demo preset, adjust meeting fields, and generate. Confirm the report
   is visibly labeled mock/unverified. History must not gain a record until saved.
3. Click **Save demo briefing**. Confirm success, then open History. Check the
   target type, meeting date/time, status and citation count. Save a second report
   with the same target and confirm it is a separate record, newest first.
4. Reload the page, reopen the first report from History, and compare its meeting
   details and content. Click citation references in detailed and one-page modes;
   check print/export, which must retain demo labels. There must be no generation
   pipeline when reopening. In Supabase's table viewer, check this test record's
   report provenance and associated `briefing_sources` rows.
5. Cancel deletion and confirm the record remains. Delete only your newly created
   test record and accept confirmation. Reload; confirm it stays deleted and its
   source rows have cascaded away. Do not delete preexisting user records.
6. Sign in as test user B in a separate browser profile. A's records must not
   appear. To test RLS independently of the application's ownership filter, open
   DevTools Console on the local Vite app and execute the following read-only
   requests, substituting A's newly created test briefing UUID:

   ```js
   const { supabase } = await import('/src/lib/supabase.js');
   await supabase.from('briefings').select('id').eq('id', 'A_TEST_BRIEFING_UUID');
   await supabase.from('briefing_sources').select('id').eq('briefing_id', 'A_TEST_BRIEFING_UUID');
   ```

   Both results must contain an empty data array. Never print or share sessions,
   tokens or passwords. Confirm B can save/reopen their own test report, then
   switch back to A and verify A's remaining reports are intact.
7. Set DevTools Network to Offline, attempt history refresh and save, and confirm
   clear errors. Restore connectivity and retry. For partial saves, block
   `*/rest/v1/briefing_sources*` in DevTools request blocking before saving a new
   demo. Confirm the partial-save warning, unblock requests, and retry. Check
   there is exactly one parent and the expected source rows, including after reload.
8. Test logout/login/session persistence again. With a disposable test session
   revoked or expired, database actions should direct you to sign in again. Check
   the permission message using an isolated test environment or a mocked 403;
   do not alter production RLS to induce a failure. Verify an account with no
   saved briefings sees the empty state, including one with no `profiles` row.

Live browser flows, email delivery, deployed schema equivalence, session expiry,
and actual two-account RLS enforcement require manual verification. No live
records, schema, policies, environment files, commits or pushes are changed by
the automated checks.
