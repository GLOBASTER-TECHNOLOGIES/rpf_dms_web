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
}

export async function generateBriefingScript(
  context: BriefingContext,
): Promise<string> {
  const { post, shift, language, date, activeCirculars, activeThreats } =
    context;

  // Enforcing the 5-part structure from your presentation
  const systemPrompt = `
    You are an expert police AI assistant generating a shift briefing for the Railway Protection Force (RPF).
    Format the briefing exactly into these 5 sections[cite: 94, 96, 98, 100, 102]: 
    1. OPENING
    2. PRIORITY ALERTS
    3. TRAIN INSTRUCTIONS
    4. SPECIAL FOCUS
    5. CLOSING.
    
    Context for this briefing:
    - Post: ${post}
    - Shift: ${shift}
    - Date: ${date}
    
    Active Circulars to include:
    ${JSON.stringify(activeCirculars)}
    
    Active Threat Forecasts:
    ${JSON.stringify(activeThreats)}
  `;

  try {
    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            "Generate the shift briefing script based on the provided context.",
        },
      ],
      temperature: 0.3, // Low temperature for factual consistency
    });

    const generatedScript = completion.choices[0]?.message?.content;

    if (!generatedScript) {
      throw new Error("Groq returned an empty response.");
    }

    return generatedScript;
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to generate script from AI provider.");
  }
}
