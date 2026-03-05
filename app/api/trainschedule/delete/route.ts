import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import mongoose from "mongoose";
import TrainSchedule from "@/models/TrainSchedule";

export async function DELETE(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid train id" },
        { status: 400 },
      );
    }

    const train = await TrainSchedule.findByIdAndDelete(id);

    if (!train) {
      return NextResponse.json(
        { success: false, message: "Train not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Train schedule deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to delete train schedule" },
      { status: 500 },
    );
  }
}
