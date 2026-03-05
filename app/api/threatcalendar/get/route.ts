import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import ThreatCalendar from "@/models/ThreatCalendar.model";

export async function GET() {
  try {
    await dbConnect();

    const events = await ThreatCalendar.find().sort({ startDate: 1 });

    return NextResponse.json(
      { success: true, data: events },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch threat events" },
      { status: 500 }
    );
  }
}