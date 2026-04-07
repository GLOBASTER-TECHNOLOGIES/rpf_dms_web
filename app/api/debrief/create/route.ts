import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Debrief from "@/models/Debrief.model";
import connectDB from "@/config/dbConnect";
import { generateDebriefAnalysis } from "@/config/debriefAI";
import Shift from "@/models/ShiftDetails.model"; // Ensure path is correct

function getShiftContext(): { shift: "Morning" | "Afternoon" | "Night" } {
  const now = new Date();
  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const istHour = istTime.getHours();

  let shift: "Morning" | "Afternoon" | "Night" = "Night";
  if (istHour >= 6 && istHour < 14) shift = "Morning";
  else if (istHour >= 14 && istHour < 22) shift = "Afternoon";

  return { shift };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 1. Authentication
    const cookieToken = req.cookies.get("accessToken")?.value;
    const authHeader = req.headers.get("authorization");
    const token =
      cookieToken ||
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

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

    // 2. Get Current Shift Context (with Night shift date fix)
    const { shift } = getShiftContext();

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);

    let year = istTime.getUTCFullYear();
    let month = istTime.getUTCMonth();
    let day = istTime.getUTCDate();
    const istHour = istTime.getUTCHours();

    // ✅ SAME fix as shift creation: after midnight but before 6 AM,
    // the Night shift still belongs to the previous calendar day.
    if (istHour < 6 && shift === "Night") {
      day = day - 1;
    }

    const dayStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    // 3. CHECK IF OFFICER IS IN THE SHIFT LIST
    const activeShift = await Shift.findOne({
      shiftName: shift,
      shiftDate: { $gte: dayStart, $lte: dayEnd },
      officers: decoded.id,
    });

    if (!activeShift) {
      return NextResponse.json(
        {
          success: false,
          message: "Ask SO to add you to officer list of shift",
        },
        { status: 403 },
      );
    }

    // 4. Input Validation
    const { transcript, trainNumber, hasIncident } = await req.json();
    if (!transcript?.trim())
      return NextResponse.json(
        { success: false, message: "Transcript required" },
        { status: 400 },
      );

    // 5. AI Analysis
    let aiResult: {
      summary: string;
      observations: string;
      improvements: string;
    };
    try {
      aiResult = await generateDebriefAnalysis(transcript);
    } catch {
      aiResult = {
        summary: "Duty report submitted.",
        observations: "No major observations.",
        improvements: "Standard monitoring.",
      };
    }

    const newReport = {
      trainNo: trainNumber?.trim() || null,
      transcript,
      summary: aiResult.summary,
      observations: Array.isArray(aiResult.observations)
        ? aiResult.observations.join("\n")
        : aiResult.observations,
      improvements: Array.isArray(aiResult.improvements)
        ? aiResult.improvements.join("\n")
        : aiResult.improvements,
      submittedAt: new Date(),
    };

    // 6. Save Debrief (also fix the date range here)
    const debrief = await Debrief.findOneAndUpdate(
      {
        staffId: decoded.id,
        shift,
        date: { $gte: dayStart, $lte: dayEnd },
      },
      {
        $setOnInsert: {
          staffId: decoded.id,
          shift,
          date: new Date(),
          approved: false,
        },
        $push: { reports: newReport },
      },
      {
        new: true,
        upsert: true,
      },
    );

    return NextResponse.json(
      {
        success: true,
        data: debrief,
        reportCount: debrief.reports.length,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE DEBRIEF ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
