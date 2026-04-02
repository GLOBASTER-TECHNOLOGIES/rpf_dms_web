import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Shift from "@/models/ShiftDetails.model";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const post = searchParams.get("post");
    const shiftName = searchParams.get("shift");
    // Ignore date from params

    if (!post || !shiftName) {
      return NextResponse.json(
        { success: false, message: "Missing query params: post, shift" },
        { status: 400 },
      );
    }

    // --- SERVER TIME LOGIC (IST) ---
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);

    let year = istTime.getUTCFullYear();
    let month = istTime.getUTCMonth();
    let day = istTime.getUTCDate();
    const istHour = istTime.getUTCHours();

    if (istHour < 6 && shiftName === "Night") {
      day = day - 1;
    }

    const dayStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    const query = {
      post: post.trim().toUpperCase(),
      shiftName: shiftName.trim(), // Exact match, no regex
      shiftDate: { $gte: dayStart, $lte: dayEnd },
    };

    const shift = await Shift.findOne(query)
      .populate("officers", "name forceNumber")
      .select("_id shiftName shiftDate post officers");

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
