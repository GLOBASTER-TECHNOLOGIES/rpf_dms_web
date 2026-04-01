import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Briefing from "@/models/Briefing.model";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const post = searchParams.get("post");
    const shift = searchParams.get("shift");
    const all = searchParams.get("all") === "true";

    // ─── 1. PRIORITY: GET BY ID ─────────────────────────────
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid ID" },
          { status: 400 },
        );
      }
      const briefing = await Briefing.findById(id).lean();
      return briefing
        ? NextResponse.json({ success: true, data: briefing })
        : NextResponse.json(
            { success: false, message: "Not found" },
            { status: 404 },
          );
    }

    // ─── 2. DEFAULT BEHAVIOR: RETURN ALL (NO PARAMS) ────────
    if (!post) {
      const globalBriefings = await Briefing.find({})
        .sort({ dutyDate: -1, createdAt: -1 })
        .limit(200)
        .lean();

      return NextResponse.json({
        success: true,
        count: globalBriefings.length,
        data: globalBriefings,
        isAdminView: true,
      });
    }

    // ─── 3. FILTERED ARCHIVE: GET ALL FOR SPECIFIC POST ─────
    if (all) {
      const postHistory = await Briefing.find({ post })
        .sort({ dutyDate: -1, createdAt: -1 })
        .lean();

      return NextResponse.json({
        success: true,
        count: postHistory.length,
        data: postHistory,
        isHistory: true,
      });
    }

    // ─── 4. SPECIFIC LOGIC: POST + SHIFT (DUTY VIEW) ────────
    if (!shift) {
      return NextResponse.json(
        {
          success: false,
          message: "Shift is required for specific post lookup",
        },
        { status: 400 },
      );
    }

    // 🔥 NEW SIMPLIFIED LOGIC: Just grab the absolute latest entry
    const latestBriefing = await Briefing.find({ post, shift })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(1) // Only grab the top 1 result
      .lean();

    if (latestBriefing.length > 0) {
      return NextResponse.json({
        success: true,
        data: latestBriefing, // Returns an array with 1 item inside, so Flutter doesn't crash
        isFallback: false, // Kept so your Flutter UI still works flawlessly
      });
    }

    return NextResponse.json({
      success: false,
      message: "No briefings found for this post and shift.",
    });
  } catch (error) {
    console.error("Briefing GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
