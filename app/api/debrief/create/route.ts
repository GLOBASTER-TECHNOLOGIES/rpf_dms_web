import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Debrief from "@/models/Debrief.model";
import connectDB from "@/config/dbConnect";
import { generateDebriefAnalysis } from "@/config/debriefAI";

function getShiftContext() {
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

    const { transcript } = await req.json();
    if (!transcript?.trim())
      return NextResponse.json(
        { success: false, message: "Transcript required" },
        { status: 400 },
      );

    const { shift } = getShiftContext();

    let aiResult;
    try {
      aiResult = await generateDebriefAnalysis(transcript);
    } catch {
      aiResult = {
        summary: "Duty report submitted.",
        observations: "No major observations.",
        improvements: "Standard monitoring.",
      };
    }

    const debrief = await Debrief.create({
      staffId: decoded.id,
      shift,
      date: new Date(), // actual UTC timestamp — falls correctly in shift window
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