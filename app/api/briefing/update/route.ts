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
        { status: 400 },
      );
    }

    const body = await req.json();

    // Allow updating all editable fields
    const allowedUpdates: Record<string, any> = {};

    if (body.post !== undefined) allowedUpdates.post = body.post;
    if (body.shift !== undefined) allowedUpdates.shift = body.shift;
    if (body.dutyDate !== undefined) allowedUpdates.dutyDate = body.dutyDate;
    if (body.briefingScript !== undefined)
      allowedUpdates.briefingScript = body.briefingScript;

    // Keep existing status fields if provided
    if (body.isDelivered !== undefined)
      allowedUpdates.isDelivered = body.isDelivered;
    if (body.deliveredAt !== undefined)
      allowedUpdates.deliveredAt = body.deliveredAt;
    if (body.isPrinted !== undefined) allowedUpdates.isPrinted = body.isPrinted;

    const briefing = await Briefing.findByIdAndUpdate(id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    if (!briefing) {
      return NextResponse.json(
        { success: false, message: "Briefing not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: briefing });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to update briefing" },
      { status: 500 },
    );
  }
}
