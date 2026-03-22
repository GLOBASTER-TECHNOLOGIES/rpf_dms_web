import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Shift from "@/models/ShiftDetails.model";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const post = searchParams.get("post");
    const shiftName = searchParams.get("shift");
    const date = searchParams.get("date");

    if (!post || !shiftName || !date) {
      return NextResponse.json(
        { success: false, message: "Missing query params: post, shift, date" },
        { status: 400 },
      );
    }

    // Match the full day in UTC for shiftDate
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const shift = await Shift.findOne({
      post: post.toUpperCase(),
      shiftName: shiftName,
      shiftDate: { $gte: dayStart, $lte: dayEnd },
    }).select("_id shiftName shiftDate post officers");

    if (!shift) {
      return NextResponse.json({ success: true, exists: false, data: null });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      data: shift,
    });
  } catch (error) {
    console.error("shift-details/get error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
