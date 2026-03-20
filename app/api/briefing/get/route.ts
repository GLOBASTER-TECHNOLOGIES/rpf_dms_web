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
    // If a specific ID is asked for, return only that.
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
    // If NO 'post' is provided, return every briefing in the DB.
    // This covers your request: "if no query param is coming, return all".
    if (!post) {
      const globalBriefings = await Briefing.find({})
        .sort({ dutyDate: -1, createdAt: -1 })
        .limit(200) // Performance safety net
        .lean();

      return NextResponse.json({
        success: true,
        count: globalBriefings.length,
        data: globalBriefings,
        isAdminView: true,
      });
    }

    // ─── 3. FILTERED ARCHIVE: GET ALL FOR SPECIFIC POST ─────
    // URL: /api/briefing/get?post=TPJ&all=true
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
    // URL: /api/briefing/get?post=TPJ&shift=Morning
    if (!shift) {
      return NextResponse.json(
        {
          success: false,
          message: "Shift is required for specific post lookup",
        },
        { status: 400 },
      );
    }

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Try finding today's specific briefing
    const todayBriefing = await Briefing.find({
      post,
      shift,
      dutyDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (todayBriefing.length > 0) {
      return NextResponse.json({
        success: true,
        data: todayBriefing,
        isFallback: false,
      });
    }

    // FALLBACK: Last available briefing for this post if today's is missing
    const fallbackBriefing = await Briefing.findOne({
      post,
      dutyDate: { $lt: startOfDay },
    })
      .sort({ dutyDate: -1 })
      .lean();

    if (fallbackBriefing) {
      return NextResponse.json({
        success: true,
        data: [fallbackBriefing],
        isFallback: true,
        message: "No briefing for today. Showing previous available record.",
      });
    }

    return NextResponse.json({
      success: false,
      message: "No briefings found for this post.",
    });
  } catch (error) {
    console.error("Briefing GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
