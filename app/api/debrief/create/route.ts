import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Debrief from "@/models/Debrief.model";
import connectDB from "@/config/dbConnect";
import { generateDebriefAnalysis } from "@/config/debriefAI";

// ─────────────────────────────────────────
// Determine Shift Based on IST Time
// ─────────────────────────────────────────
function getCurrentShift(): "Morning" | "Afternoon" | "Night" {
  const now = new Date();

  const istHour = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  ).getHours();

  if (istHour >= 6 && istHour < 14) return "Morning";
  if (istHour >= 14 && istHour < 22) return "Afternoon";
  return "Night";
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ─────────────────────────────────────────
    // 1️⃣ Get Token
    // ─────────────────────────────────────────
    const cookieToken = req.cookies.get("accessToken")?.value;
    const authHeader = req.headers.get("authorization");

    let token = cookieToken;

    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token provided" },
        { status: 401 },
      );
    }

    // ─────────────────────────────────────────
    // 2️⃣ Verify JWT
    // ─────────────────────────────────────────
    let decoded: { id: string };

    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as {
        id: string;
      };
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // ─────────────────────────────────────────
    // 3️⃣ Parse Body
    // ─────────────────────────────────────────
    const body = await req.json();
    const { transcript } = body;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Transcript cannot be empty" },
        { status: 400 },
      );
    }

    // ─────────────────────────────────────────
    // 4️⃣ Detect Shift Automatically
    // ─────────────────────────────────────────
    const shift = getCurrentShift();

    // ─────────────────────────────────────────
    // 5️⃣ Run AI Analysis
    // ─────────────────────────────────────────
    let summary = "";
    let observations = "";
    let improvements = "";

    try {
      const aiResult = await generateDebriefAnalysis(transcript);

      summary = aiResult.summary || "";

      // Convert array → string safely
      observations = Array.isArray(aiResult.observations)
        ? aiResult.observations.join("\n")
        : aiResult.observations || "";

      improvements = Array.isArray(aiResult.improvements)
        ? aiResult.improvements.join("\n")
        : aiResult.improvements || "";
    } catch (err) {
      console.error("AI generation failed:", err);

      // fallback if AI fails
      summary = "Duty report submitted.";
      observations = "No major operational observations recorded.";
      improvements = "Continue standard security monitoring.";
    }

    // ─────────────────────────────────────────
    // 6️⃣ Save Debrief
    // ─────────────────────────────────────────
    const debrief = await Debrief.create({
      staffId: decoded.id,
      shift,
      transcript,
      summary,
      observations,
      improvements,
    });

    // ─────────────────────────────────────────
    // 7️⃣ Return Response
    // ─────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        message: "Debrief created successfully",
        data: debrief,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE DEBRIEF ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while creating debrief",
      },
      { status: 500 },
    );
  }
}
