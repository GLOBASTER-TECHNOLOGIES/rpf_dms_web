import Groq from "groq-sdk";

// Initialize Groq outside the function so it's not recreated on every call
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
  trainSchedule: any[]; // Add this to pass train data
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
    trainSchedule,
  } = context;

  const systemPrompt = `
    You are a strict, data-driven intelligence AI for the Railway Protection Force (RPF).
    Your task is to generate a factual, bulleted shift briefing based ONLY on the provided JSON data.

    CRITICAL RULES:
    - NO CONVERSATIONAL FILLER. Do not say "Good morning", "Welcome team", or "Have a good shift".
    - NO HALLUCINATIONS. Do NOT invent train names, numbers, platforms, or threat events. If data is missing, use the default fallback text.
    - NO FLUFF. Use concise, professional law enforcement terminology.
    - Output MUST be strictly bullet points under the exact 5 headings requested[cite: 94, 96, 98, 100, 102].
    - Translate the entire output into ${language}.

    FORMAT AND DATA MAPPING INSTRUCTIONS:

    1. OPENING:
       - Bullet point the Date, Post, and Shift.

    2. PRIORITY ALERTS:
       - Summarize the 'Active Circulars' JSON into concise, actionable bullet points.
       - If the JSON is empty, output exactly: "- No active circulars for this shift."

    3. TRAIN INSTRUCTIONS:
       - Summarize security requirements for the trains listed in the 'Train Schedule' JSON.
       - If the JSON is empty, output exactly: "- Maintain standard platform monitoring protocols."

    4. SPECIAL FOCUS:
       - Summarize crowd management or security advisories from the 'Active Threat Forecasts' JSON.
       - If the JSON is empty, output exactly: "- No special threat forecasts for this shift."

    5. CLOSING:
       - Output exactly: "- Ensure strict compliance with RPF values. Maintain vigilance."

    === RAW DATA ===
    - Post: ${post}
    - Shift: ${shift}
    - Date: ${date}
    
    Active Circulars:
    ${JSON.stringify(activeCirculars)}
    
    Train Schedule:
    ${JSON.stringify(trainSchedule)}
    
    Active Threat Forecasts:
    ${JSON.stringify(activeThreats)}
  `;

  try {
    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3-32b", // Or whatever reasoning model you are using
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            "Generate the shift briefing script based on the provided context.",
        },
      ],
      temperature: 0.1, // Dropped even lower to enforce strict formatting
    });

    let generatedScript = completion.choices[0]?.message?.content;

    if (!generatedScript) {
      throw new Error("Groq returned an empty response.");
    }

    // THIS IS THE MAGIC LINE:
    // It finds <think>...</think> (including all newlines) and replaces it with nothing.
    generatedScript = generatedScript
      .replace(/<think>[\s\S]*?<\/think>/gi, "") // Removes the thinking block
      .replace(/\*\*/g, "") // Removes all double asterisks
      .trim();
      
    return generatedScript;
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to generate script from AI provider.");
  }
}
