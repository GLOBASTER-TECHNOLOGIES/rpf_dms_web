import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import ThreatCalendar from "@/models/ThreatCalendar.model";
import mongoose from "mongoose";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid event id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const event = await ThreatCalendar.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update threat event" },
      { status: 500 }
    );
  }
}