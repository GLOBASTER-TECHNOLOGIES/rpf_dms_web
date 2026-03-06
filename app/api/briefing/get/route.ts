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

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid briefing id" },
          { status: 400 }
        );
      }

      const briefing = await Briefing.findById(id).lean();

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
    }

    const filter: any = {};

    if (post) filter.post = post;
    if (shift) filter.shift = shift;

    const briefings = await Briefing.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: briefings.length,
      data: briefings,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch briefings" },
      { status: 500 }
    );
  }
}