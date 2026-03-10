import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.RPF_DMS_AI_KEY,
});

interface DebriefAIResult {
  summary: string;
  observations: string;
  improvements: string;
}

export async function generateDebriefAnalysis(
  transcript: string,
): Promise<DebriefAIResult> {
  const systemPrompt = `
You are an intelligence assistant for Railway Protection Force (RPF).

Analyze the duty debrief transcript and produce structured output.

STRICT RULES:
- Output ONLY valid JSON.
- Do NOT include explanations.
- Do NOT include <think> tags.
- Do NOT include markdown.

FORMAT:

{
 "summary": "short paragraph summarizing the duty report",
 "observations": "key operational observations",
 "improvements": "suggested improvements for future shifts"
}

TRANSCRIPT:
${transcript}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: "Analyze the transcript and return the JSON report.",
        },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      throw new Error("Groq returned empty response");
    }

    // ─────────────────────────────
    // CLEAN AI OUTPUT
    // ─────────────────────────────

    const cleaned = raw
      .replace(/<think>[\s\S]*?<\/think>/gi, "") // remove reasoning
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON block safely
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      summary: parsed.summary || "",
      observations: parsed.observations || "",
      improvements: parsed.improvements || "",
    };
  } catch (error: any) {
    console.error("Debrief AI Error:", error);

    throw new Error(
      `Debrief AI generation failed: ${error.message || "Unknown error"}`,
    );
  }
}
