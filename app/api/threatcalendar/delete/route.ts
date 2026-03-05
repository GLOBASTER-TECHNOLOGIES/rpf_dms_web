import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import ThreatCalendar from "@/models/ThreatCalendar.model";
import mongoose from "mongoose";

export async function DELETE(req: Request) {
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

    const event = await ThreatCalendar.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to delete threat event" },
      { status: 500 }
    );
  }
}