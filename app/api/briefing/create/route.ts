import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Briefing from "@/models/Briefing.model";
import Circular from "@/models/Circular.model"; // Make sure to import this
import ThreatCalendar from "@/models/ThreatCalendar.model"; // Make sure to import this
import { generateBriefingScript } from "@/config/ai"; // Your Groq function

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    // Notice we do NOT extract generatedScript from the body anymore.
    // The frontend only sends these 4 things:
    const { stationOfficerId, post, shift, language } = body;

    if (!stationOfficerId || !post || !shift || !language) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const today = new Date();

    // 1. Fetch active context from the database
    // (You will need to create the Circular and ThreatCalendar models if you haven't yet)
    const activeCirculars = await Circular.find({
      activeFrom: { $lte: today },
      activeTo: { $gte: today },
      $or: [{ targetPosts: post }, { targetPosts: { $size: 0 } }],
    }).lean();

    const activeThreats = await ThreatCalendar.find({
      startDate: { $lte: today },
      endDate: { $gte: today },
      $or: [{ affectedPosts: post }, { affectedPosts: { $size: 0 } }],
    }).lean();

    // 2. THIS IS WHERE THE AI IS USED
    // We pass the data to your Groq function, and it returns the text.
    const generatedScript = await generateBriefingScript({
      post,
      shift,
      language,
      date: today.toDateString(),
      activeCirculars,
      activeThreats,
    });

    // 3. Now we populate the database model with the AI's output
    const briefing = await Briefing.create({
      stationOfficerId,
      post,
      shift,
      language,
      dutyDate: today,
      generatedScript, // We inject the AI's response here
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
