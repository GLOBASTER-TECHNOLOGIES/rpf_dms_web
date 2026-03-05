import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TrainSchedule from "@/models/TrainSchedule";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      trainNumber,
      trainName,
      arrivalTime,
      departureTime,
      platform,
      daysOfRun,
      source,
      destination,
    } = body;

    if (
      !trainNumber ||
      !trainName ||
      !arrivalTime ||
      !platform ||
      !source ||
      !destination
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const train = await TrainSchedule.create({
      trainNumber,
      trainName,
      arrivalTime,
      departureTime,
      platform,
      daysOfRun,
      source,
      destination,
    });

    return NextResponse.json({ success: true, data: train }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to create train schedule" },
      { status: 500 },
    );
  }
}
