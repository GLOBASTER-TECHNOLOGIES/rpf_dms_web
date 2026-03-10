import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Briefing from "@/models/Briefing.model";
import Circular from "@/models/Circular.model";
import ThreatCalendar from "@/models/ThreatCalendar.model";
import Instruction from "@/models/Instruction.model";
import TrainSchedule from "@/models/TrainSchedule";
import Officer from "@/models/Officer.model"; // <-- Added Officer model import
import { generateBriefingScript } from "@/config/ai";

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function filterTrainsByShift(trains: any[], shift: string) {
  const MORNING_START = 6 * 60;
  const MORNING_END = 14 * 60;

  const AFTERNOON_START = 14 * 60;
  const AFTERNOON_END = 22 * 60;

  const NIGHT_START = 22 * 60;
  const NIGHT_END = 6 * 60;

  return trains.filter((train) => {
    const arrival = timeToMinutes(train.arrivalTime);

    if (shift === "morning") {
      return arrival >= MORNING_START && arrival < MORNING_END;
    }

    if (shift === "afternoon") {
      return arrival >= AFTERNOON_START && arrival < AFTERNOON_END;
    }

    if (shift === "night") {
      return arrival >= NIGHT_START || arrival < NIGHT_END;
    }

    return false;
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log("req came");

    await dbConnect();

    // 1. EXTRACT TOKEN: Check cookies first (Next.js Web), then fallback to Authorization header (Flutter/Mobile)
    let token = req.cookies.get("accessToken")?.value;

    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    // 2. VERIFY TOKEN
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token." },
        { status: 401 },
      );
    }

    // 3. GET OFFICER DETAILS FROM DB
    const officer = await Officer.findById(decoded.id);
    if (!officer || !officer.active) {
      return NextResponse.json(
        { success: false, message: "Officer not found or account inactive." },
        { status: 401 },
      );
    }

    const createdByOfficerId = officer._id;

    // 4. PARSE BODY
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

    const normalizedShift = shift.toLowerCase();
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBriefing = await Briefing.findOne({
      post,
      shift,
      dutyDate: { $gte: startOfDay, $lte: endOfDay },
    });

    // disabled for now
    // if (existingBriefing) {
    //   return NextResponse.json({ success: true, data: existingBriefing });
    // }

    const [activeCirculars, activeThreats, activeInstructions, allTrains] =
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
          shift: { $in: [normalizedShift, "all"] },
        })
          .select("-_id -createdAt -updatedAt -__v")
          .lean(),

        TrainSchedule.find().select("-_id -createdAt -updatedAt -__v").lean(),
      ]);

    const shiftTrains = filterTrainsByShift(allTrains, normalizedShift);

    console.log("Filtered trains:", shiftTrains);

    const generatedScript = "ASD";
    // const generatedScript = await generateBriefingScript({
    //   post,
    //   shift,
    //   language,
    //   date: today.toDateString(),
    //   activeCirculars,
    //   activeThreats,
    //   activeInstructions,
    //   trainSchedule: shiftTrains,
    // });

    // Create briefing using the securely retrieved Officer ID
    const briefing = await Briefing.create({
      createdByOfficerId,
      post,
      shift,
      language,
      dutyDate: today,
      generatedScript,
    });

    return NextResponse.json(
      { success: true, data: briefing, trainsUsed: shiftTrains },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Briefing Generation Pipeline Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create briefing",
      },
      { status: 500 },
    );
  }
}
