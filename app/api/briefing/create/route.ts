import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Briefing from "@/models/Briefing.model";
import Circular from "@/models/Circular.model";
import ThreatCalendar from "@/models/ThreatCalendar.model";
import { generateBriefingScript } from "@/config/ai";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const { createdByOfficerId = "69a92a2283c9f11bbc09b22b", post, shift, language } = body;

    if (!createdByOfficerId || !post || !shift || !language) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const today = new Date();

    const activeCirculars = await Circular.find({
      activeFrom: { $lte: today },
      activeTo: { $gte: today },
      $or: [{ targetPosts: post }, { targetPosts: { $size: 0 } }],
    })
      .select("-_id -createdAt -updatedAt -__v")
      .lean();

    const activeThreats = await ThreatCalendar.find({
      startDate: { $lte: today },
      endDate: { $gte: today },
    })
      .select("-_id -createdAt -updatedAt -__v")
      .lean();

    const generatedScript = await generateBriefingScript({
      post,
      shift,
      language,
      date: today.toDateString(),
      activeCirculars,
      activeThreats,
    });

    const briefing = await Briefing.create({
      createdByOfficerId,
      post,
      shift,
      language,
      dutyDate: today,
      generatedScript,
    });

    return NextResponse.json(
      { success: true, data: briefing },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Briefing Generation Pipeline Error:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Failed to create briefing" },
      { status: 500 },
    );
  }
}
