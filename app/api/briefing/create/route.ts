import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Briefing from "@/models/Briefing.model";
import Circular from "@/models/Circular.model";
import ThreatCalendar from "@/models/ThreatCalendar.model";
import Instruction from "@/models/Instruction.model";
import Officer from "@/models/Officer.model";
import { generateBriefingScript } from "@/config/ai";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // 1. Extract and verify the Officer ID from the secure cookie
    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token." },
        { status: 401 },
      );
    }

    const createdByOfficerId = decoded.id;

    // 2. Parse request body
    const body = await req.json();
    const { post, shift, language } = body;

    if (!post || !shift || !language) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: post, shift, or language",
        },
        { status: 400 },
      );
    }

    const today = new Date();
    const normalizedShift = shift.toLowerCase(); // Ensure matching with Instruction enum

    // 3. Fetch active context data concurrently
    const [activeCirculars, activeThreats, activeInstructions] =
      await Promise.all([
        Circular.find({
          activeFrom: { $lte: today },
          activeTo: { $gte: today },
          $or: [{ targetPosts: post }, { targetPosts: { $size: 0 } }],
        })
          .select("-_id -createdAt -updatedAt -__v")
          .lean(),

        ThreatCalendar.find({
          startDate: { $lte: today },
          endDate: { $gte: today },
        })
          .select("-_id -createdAt -updatedAt -__v")
          .lean(),

        Instruction.find({
          validFrom: { $lte: today },
          validTo: { $gte: today },
          shift: { $in: [normalizedShift, "all"] }, // Match specific shift or "all"
        })
          .select("-_id -createdAt -updatedAt -__v")
          .lean(),
      ]);

    // 4. Generate the script via AI
    const generatedScript = await generateBriefingScript({
      post,
      shift,
      language,
      date: today.toDateString(),
      activeCirculars,
      activeThreats,
      activeInstructions, // Pass newly fetched instructions
    });

    // 5. Save the Briefing
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
