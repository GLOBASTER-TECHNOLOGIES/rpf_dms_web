import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Debrief from "@/models/Debrief.model";
import connectDB from "@/config/dbConnect";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);

    const body = await req.json();

    const { id, transcript, summary, observations, improvements } = body;

    const updated = await Debrief.findByIdAndUpdate(
      id,
      {
        transcript,
        summary,
        observations,
        improvements,
      },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      message: "Debrief updated",
      data: updated,
    });
  } catch (error) {
    console.error("UPDATE DEBRIEF ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
