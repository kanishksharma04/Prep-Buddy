import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { env } from "@/lib/env";

const client = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

const recallQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export type RecallQuestion = z.infer<typeof recallQuestionSchema>;

// Turns a topic's freeform note into a real recall test instead of just
// showing the note verbatim — a short question plus an answer drawn only
// from the note, cached on the Topic row so it's generated once per note.
// Returns null (never throws) whenever there's nothing useful to do: no API
// key configured, an empty note, or the model call failing.
export async function generateRecallQuestion(
  title: string,
  note: string,
): Promise<RecallQuestion | null> {
  if (!client || !note.trim()) {
    return null;
  }

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 512,
      output_config: {
        effort: "low",
        format: zodOutputFormat(recallQuestionSchema),
      },
      messages: [
        {
          role: "user",
          content:
            `Topic: ${title}\n` +
            `Note: ${note}\n\n` +
            "Write one short recall question that tests whether someone remembers " +
            "this topic's key point, and a concise answer using only the note above. " +
            "Don't reference \"the note\" in either the question or the answer.",
        },
      ],
    });
    return response.parsed_output;
  } catch {
    return null;
  }
}
