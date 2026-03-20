import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Debrief from "@/models/Debrief.model";
import connectDB from "@/config/dbConnect";
import { generateDebriefAnalysis } from "@/config/debriefAI";

// ─────────────────────────────────────────
// Determine Shift & Date Based on IST Time
// ─────────────────────────────────────────
function getShiftContext() {
  const now = new Date();
  // Get IST time string
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);
  const istHour = istDate.getHours();

  let shift: "Morning" | "Afternoon" | "Night" = "Night";

  if (istHour >= 6 && istHour < 14) shift = "Morning";
  else if (istHour >= 14 && istHour < 22) shift = "Afternoon";

  return { shift, istDate };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 1️⃣ Auth Logic (Keep your existing token logic)
    const cookieToken = req.cookies.get("accessToken")?.value;
    const authHeader = req.headers.get("authorization");
    let token =
      cookieToken ||
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as {
        id: string;
      };
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    // 2️⃣ Parse Body
    const { transcript } = await req.json();
    if (!transcript?.trim()) {
      return NextResponse.json(
        { success: false, message: "Transcript required" },
        { status: 400 },
      );
    }

    // 3️⃣ Detect Shift AND Set the explicit Date
    // This ensures the 'date' field in DB exactly matches what the report query looks for
    const { shift, istDate } = getShiftContext();

    // 4️⃣ Run AI Analysis (Your existing logic)
    let aiResult;
    try {
      aiResult = await generateDebriefAnalysis(transcript);
    } catch (err) {
      console.error("AI failed, using fallback");
      aiResult = {
        summary: "Duty report submitted.",
        observations: "No major observations.",
        improvements: "Standard monitoring.",
      };
    }

    // 5️⃣ Save Debrief
    // CRITICAL: We add 'date: istDate' so the time-range query finds it!
    const debrief = await Debrief.create({
      staffId: decoded.id,
      shift,
      date: istDate, // Use the calculated IST date object
      transcript,
      summary: aiResult.summary,
      observations: Array.isArray(aiResult.observations)
        ? aiResult.observations.join("\n")
        : aiResult.observations,
      improvements: Array.isArray(aiResult.improvements)
        ? aiResult.improvements.join("\n")
        : aiResult.improvements,
    });

    return NextResponse.json({ success: true, data: debrief }, { status: 201 });
  } catch (error) {
    console.error("CREATE DEBRIEF ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
