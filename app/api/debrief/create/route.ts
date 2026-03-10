import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Debrief from "@/models/Debrief.model";
import connectDB from "@/config/dbConnect";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as { id: string };

    const body = await req.json();

    const { shift, transcript, summary, observations, improvements } = body;

    const debrief = await Debrief.create({
      staffId: decoded.id,
      shift,
      transcript,
      summary,
      observations,
      improvements,
    });

    return NextResponse.json({
      success: true,
      message: "Debrief created",
      data: debrief,
    });
  } catch (error) {
    console.error("CREATE DEBRIEF ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}