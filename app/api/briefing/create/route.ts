import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Briefing from "@/models/Briefing.model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      stationOfficerId,
      post,
      shift,
      language,
      dutyDate,
      generatedScript,
    } = body;

    if (!stationOfficerId || !post || !shift || !language || !generatedScript) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const briefing = await Briefing.create({
      stationOfficerId,
      post,
      shift,
      language,
      dutyDate,
      generatedScript,
    });

    return NextResponse.json(
      { success: true, data: briefing },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to create briefing" },
      { status: 500 }
    );
  }
}