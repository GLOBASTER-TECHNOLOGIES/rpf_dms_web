import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Circular from "@/models/Circular.model";
import mongoose from "mongoose";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid circular id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const circular = await Circular.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

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
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update circular" },
      { status: 500 }
    );
  }
}