import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Circular from "@/models/Circular.model";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid circular id" },
          { status: 400 }
        );
      }

      const circular = await Circular.findById(id);

      if (!circular) {
        return NextResponse.json(
          { success: false, message: "Circular not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: circular,
      });
    }

    const circulars = await Circular.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: circulars.length,
      data: circulars,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch circulars" },
      { status: 500 }
    );
  }
}