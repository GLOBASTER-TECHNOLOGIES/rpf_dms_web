import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import ThreatCalendar from "@/models/ThreatCalendar.model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      eventName,
      type,
      location,
      startDate,
      endDate,
      riskLevel,
      advisories,
    } = body;

    if (!eventName || !type || !startDate || !endDate || !riskLevel) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await ThreatCalendar.create({
      eventName,
      type,
      location,
      startDate,
      endDate,
      riskLevel,
      advisories,
    });

    return NextResponse.json(
      { success: true, data: event },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to create threat event" },
      { status: 500 }
    );
  }
}