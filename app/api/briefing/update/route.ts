import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Briefing from "@/models/Briefing.model";
import mongoose from "mongoose";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid briefing id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const allowedUpdates = {
      isDelivered: body.isDelivered,
      deliveredAt: body.deliveredAt,
      isPrinted: body.isPrinted,
    };

    const briefing = await Briefing.findByIdAndUpdate(
      id,
      allowedUpdates,
      { new: true }
    );

    if (!briefing) {
      return NextResponse.json(
        { success: false, message: "Briefing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: briefing,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update briefing" },
      { status: 500 }
    );
  }
}