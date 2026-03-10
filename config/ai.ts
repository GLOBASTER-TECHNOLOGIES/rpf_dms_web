import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.RPF_DMS_AI_KEY,
});

interface BriefingContext {
  post: string;
  shift: string;
  language: string;
  date: string;
  activeCirculars: any[];
  activeThreats: any[];
  activeInstructions: any[];
  trainSchedule: any[];
}

export async function generateBriefingScript(
  context: BriefingContext,
): Promise<string> {
  const {
    post,
    shift,
    language,
    date,
    activeCirculars,
    activeThreats,
    activeInstructions,
    trainSchedule,
  } = context;

  // ── HARDCODED RPF DATA FROM PDFS & DSC DIRECTIVES ────────────────
  const pdfDirectives = {
    meriSaheli:
      "Increase outreach to target passengers (Current average 26%, target 50%). Teams must be led by female staff; male staff to focus on soft skills.",
    trainSafety:
      "Alertness against miscreant activities (stone pelting) following locomotive windshield breakage incidents. Intensify patrolling in critical areas.",
    vipMovement:
      "High Alert: Movement of AGM and PCSC-cum-IG scheduled in the coming days. Ensure perfect turnout and security readiness at TPJ Post.",
  };

  const systemPrompt = `
    You are a strict, data-driven intelligence AI for the Railway Protection Force (RPF).
    Your task is to generate a shift briefing with maximum readability.

    LAYOUT RULES:
    - Use clear section headings followed by an empty line.
    - Separate each section with a dashed line (--------------------).
    - Use double spacing between different sections to prevent paragraph bunching.
    - Use bullet points (-) for all data points.

    LANGUAGE: ${language}. Headings and content must be exclusively in ${language}.

    1. OPENING:
       Formal greeting. State Post: ${post}, Shift: ${shift}, Date: ${date}.

    2. PRIORITY ALERTS (Factual/Safety):
       - Summarize data from 'Active Circulars'.
       - MANDATORY ALERT: ${pdfDirectives.trainSafety}
       - If no other data, use standard fallback.

    3. DAILY INSTRUCTIONS (Strategic):
       - Summarize data from 'Active Instructions'.
       - SR.DSC DIRECTIVE: ${pdfDirectives.vipMovement}
       - MERI SAHELI: ${pdfDirectives.meriSaheli}

    4. TRAIN-WISE INSTRUCTIONS:
       - Summarize security for first 3 trains in 'Train Schedule'.
       - Include platform and timing.

    5. SPECIAL FOCUS AREAS:
       - Identify hotspots for stone pelting or unauthorized entry.
       - Use 'Active Threat Forecasts' JSON.

    6. CLOSING:
       - "- Uphold duty, maintain discipline, and preserve public trust. Stay vigilant."

    === LIVE DATA ===
    Circulars: ${JSON.stringify(activeCirculars)}
    Instructions: ${JSON.stringify(activeInstructions)}
    Schedule: ${JSON.stringify(trainSchedule)}
    Threats: ${JSON.stringify(activeThreats)}
  `;

  try {
    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: "Generate the shift briefing with clear section spacing.",
        },
      ],
      temperature: 0.1,
    });

    let generatedScript = completion.choices[0]?.message?.content;

    if (!generatedScript) throw new Error("Empty response from AI.");

    // Final cleanup to ensure no markdown bolding and no <think> tags
    generatedScript = generatedScript
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/\*\*/g, "")
      .trim();

    return generatedScript;
  } catch (error: any) {
    console.error("Groq API Error:", error);
    throw new Error(`AI Generation Failed: ${error.message}`);
  }
}
