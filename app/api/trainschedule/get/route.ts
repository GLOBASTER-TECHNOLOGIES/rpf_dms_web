import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TrainSchedule from "@/models/TrainSchedule";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const shift = searchParams.get("shift");

    if (shift) {
      let timeFilter = {};

      if (shift === "Morning") {
        timeFilter = { arrivalTime: { $gte: "06:00", $lt: "14:00" } };
      } else if (shift === "Afternoon") {
        timeFilter = { arrivalTime: { $gte: "14:00", $lt: "22:00" } };
      } else if (shift === "Night") {
        timeFilter = {
          $or: [
            { arrivalTime: { $gte: "22:00" } },
            { arrivalTime: { $lt: "06:00" } },
          ],
        };
      }

      const trains = await TrainSchedule.find(timeFilter).sort({
        arrivalTime: 1,
      });
      return NextResponse.json({
        success: true,
        count: trains.length,
        data: trains,
      });
    }

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
