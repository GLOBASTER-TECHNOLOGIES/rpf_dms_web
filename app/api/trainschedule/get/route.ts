import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TrainSchedule from "@/models/TrainSchedule";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid train id" },
          { status: 400 },
        );
      }

      const train = await TrainSchedule.findById(id);

      if (!train) {
        return NextResponse.json(
          { success: false, message: "Train not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: train,
      });
    }

    const trains = await TrainSchedule.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: trains.length,
      data: trains,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch trains" },
      { status: 500 },
    );
  }
}
