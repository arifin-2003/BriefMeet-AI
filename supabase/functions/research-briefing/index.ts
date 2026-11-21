// Explicit runtime specifiers also resolve when the remote bundler has no parent import map.
// deno-lint-ignore no-import-prefix
import "jsr:@supabase/functions-js@2.119.0/edge-runtime.d.ts";
// deno-lint-ignore no-import-prefix
import { withSupabase } from "jsr:@supabase/server@1.9.2";
import { createResearchHandler } from "./pipeline.ts";

// Preserve user JWT authentication around the entire research pipeline.
export default {
  fetch: withSupabase({ auth: ["user"] }, createResearchHandler()),
};
