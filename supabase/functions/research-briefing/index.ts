
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

type ResearchInput = {
  targetName?: string;
  targetType?: "company" | "person";
};

export default {
  fetch: withSupabase(
    { auth: ["user"] },
    async (req) => {
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405 }
        );
      }

      let input: ResearchInput;

      try {
        input = await req.json();
      } catch {
        return Response.json(
          { error: "Invalid JSON body" },
          { status: 400 }
        );
      }

      const targetName = input.targetName?.trim();
      const targetType = input.targetType ?? "company";

      if (
        !targetName ||
        targetName.length > 120 ||
        !["company", "person"].includes(targetType)
      ) {
        return Response.json(
          { error: "Invalid research target" },
          { status: 400 }
        );
      }

      const apiKey = Deno.env.get("TAVILY_API_KEY");

      if (!apiKey) {
        return Response.json(
          { error: "Research service is not configured" },
          { status: 503 }
        );
      }

      const query =
        targetType === "company"
          ? `${targetName} latest news company developments leadership`
          : `${targetName} latest news professional background`;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          15000
        );

        let response: Response;

        try {
          response = await fetch(
            "https://api.tavily.com/search",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                query,
                search_depth: "basic",
                max_results: 5,
                include_answer: false,
                include_raw_content: false,
              }),
              signal: controller.signal,
            }
          );
        } finally {
          clearTimeout(timeout);
        }

        if (!response.ok) {
          console.error(
            "Tavily request failed:",
            response.status
          );

          return Response.json(
            { error: "Research provider unavailable" },
            { status: 502 }
          );
        }

        const data = await response.json();

        return Response.json({
          targetName,
          targetType,
          query,
          sources: (data.results ?? []).map(
            (item: {
              title?: string;
              url?: string;
              content?: string;
              published_date?: string;
              score?: number;
            }) => ({
              title: item.title ?? "",
              url: item.url ?? "",
              content: item.content ?? "",
              publishedDate: item.published_date ?? null,
              score: item.score ?? null,
            })
          ),
          provider: "tavily",
          generatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Research request error:", error);

        return Response.json(
          { error: "Research request failed" },
          { status: 502 }
        );
      }
    }
  ),
};
