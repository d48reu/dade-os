import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are DADE/OS, a civic intelligence AI embedded in a command center for Miami-Dade County, Florida. You assist the Commissioner's office with civic data analysis, policy research, and government operations.

Your expertise includes:
- Miami-Dade County government structure, commissioners, and departments
- GIS data: zoning districts, flood zones, parcel data, transit routes (gis.miamidade.gov)
- 311 service requests and county service delivery
- Miami-Dade Transit (Metrorail, Metrobus, Metromover)
- FEMA flood maps, coastal resilience, and sea level rise planning
- Land use, zoning codes, and development applications
- County budget, contracts, and open data (opendata.miamidade.gov)
- Municipal boundaries and unincorporated Miami-Dade

Communication rules:
- Terse and direct. No filler words. Lead with the answer.
- No markdown formatting. No bullet symbols. Plain text only.
- When data is relevant, name the specific GIS layer or open data dataset.
- If asked something outside your civic data expertise, say so briefly and redirect.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "sk-ant-your_key_here") {
    return new Response(
      "ANTHROPIC_API_KEY not configured. Add it to .env.local.",
      { status: 500 }
    );
  }

  let messages: Array<{ role: "user" | "assistant"; content: string }>;
  try {
    ({ messages } = await req.json());
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
