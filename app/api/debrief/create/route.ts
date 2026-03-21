import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Debrief from "@/models/Debrief.model";
import connectDB from "@/config/dbConnect";
import { generateDebriefAnalysis } from "@/config/debriefAI";

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

    // ── Flutter sends "trainNumber", destructure accordingly ─────────────
    const { transcript, trainNumber } = await req.json();

    if (!transcript?.trim())
      return NextResponse.json(
        { success: false, message: "Transcript required" },
        { status: 400 },
      );

    const { shift } = getShiftContext();

    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    const startOfDayIST = new Date(nowIST);
    startOfDayIST.setHours(0, 0, 0, 0);
    const endOfDayIST = new Date(nowIST);
    endOfDayIST.setHours(23, 59, 59, 999);

    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const startUTC = new Date(startOfDayIST.getTime() - istOffsetMs);
    const endUTC = new Date(endOfDayIST.getTime() - istOffsetMs);

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
      trainNo: trainNumber?.trim() || null, // ← fixed: was trainNo (undefined), now trainNumber
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

    const debrief = await Debrief.findOneAndUpdate(
      {
        staffId: decoded.id,
        shift,
        date: { $gte: startUTC, $lte: endUTC },
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
