import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import mongoose from "mongoose";
import TrainSchedule from "@/models/TrainSchedule";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid train id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const train = await TrainSchedule.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    if (!train) {
      return NextResponse.json(
        { success: false, message: "Train not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: train,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update train schedule" },
      { status: 500 }
    );
  }
}