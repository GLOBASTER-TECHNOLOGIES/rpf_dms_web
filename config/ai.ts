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
  // trainSchedule: any[]; // Uncomment when you add the train DB
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
    // trainSchedule,
  } = context;

  const systemPrompt = `
    You are a strict, data-driven intelligence AI for the Railway Protection Force (RPF).
    Your task is to generate a factual, bulleted shift briefing based ONLY on the provided JSON data.

    LANGUAGE REQUIREMENT:
    - The requested output language is: ${language}.
    - The ENTIRE output, including ALL section headings, bullet points, and fallback text, MUST be written exclusively in ${language}.
    - Do not mix languages.

    CRITICAL RULES:
    - NO HALLUCINATIONS. Do NOT invent train names, numbers, platforms, circulars, or threat events. If data is missing, use the default fallback text.
    - NO FLUFF. Keep descriptions concise and use professional law enforcement terminology.
    - NO MARKDOWN BOLDING. Do not use asterisks (**) for bolding. Output plain text only.
    - BULLET POINTS: Use ONLY the hyphen character (-) for bullet points.
    - Output MUST be strictly formatted under the exact 5 headings requested below.

    FORMAT AND DATA MAPPING INSTRUCTIONS:

    1. OPENING:
       - Greet the staff formally, and state the Shift, Date, and Post.

    2. PRIORITY ALERTS:
       - Summarize up to 3 key issues from the 'Active Circulars' JSON into concise, actionable bullet points.
       ${language === "English" 
         ? `- If empty, output EXACTLY: "- No active priority alerts for this shift."` 
         : `- If empty, output the literal ${language} translation of: "- No active priority alerts for this shift."`
       }

    3. TRAIN-WISE INSTRUCTIONS:
       - Summarize security requirements for the first 3 trains listed in the 'Train Schedule' JSON.
       ${language === "English" 
         ? `- If empty, output EXACTLY: "- Maintain standard platform monitoring protocols for all arriving trains."` 
         : `- If empty, output the literal ${language} translation of: "- Maintain standard platform monitoring protocols for all arriving trains."`
       }

    4. SPECIAL FOCUS AREAS:
       - Summarize crowd management or security advisories based on the 'Active Threat Forecasts' JSON.
       ${language === "English" 
         ? `- If empty, output EXACTLY: "- No special focus events scheduled for this shift."` 
         : `- If empty, output the literal ${language} translation of: "- No special focus events scheduled for this shift."`
       }

    5. CLOSING REMINDER:
       ${language === "English" 
         ? `- Output EXACTLY: "- Uphold duty, maintain discipline, and preserve public trust. Stay vigilant."` 
         : `- Output the literal ${language} translation of the following sentence without rephrasing or adding jargon: "- Uphold duty, maintain discipline, and preserve public trust. Stay vigilant."`
       }

    === RAW DATA ===
    - Post: ${post}
    - Shift: ${shift}
    - Date: ${date}
    
    Active Circulars:
    ${JSON.stringify(activeCirculars, null, 2)}
    
    Train Schedule:
    [] 
    
    Active Threat Forecasts:
    ${JSON.stringify(activeThreats, null, 2)}
  `;

  try {
    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3-32b", 
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: "Generate the shift briefing script based on the provided context.",
        },
      ],
      temperature: 0.1, 
    });

    let generatedScript = completion.choices[0]?.message?.content;

    if (!generatedScript) {
      throw new Error("Groq returned an empty response.");
    }

    // Clean up the output string to prevent Markdown or reasoning tags
    generatedScript = generatedScript
      .replace(/<think>[\s\S]*?<\/think>/gi, "") 
      .replace(/\*\*/g, "") 
      .trim();

    return generatedScript;
  } catch (error: any) {
    console.error("Groq API Error:", error);
    throw new Error(`AI Generation Failed: ${error.message || "Unknown error"}`);
  }
}