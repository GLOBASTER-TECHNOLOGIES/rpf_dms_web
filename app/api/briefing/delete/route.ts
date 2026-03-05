import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Briefing from "@/models/Briefing.model";
import mongoose from "mongoose";

export async function DELETE(req: Request) {
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

    const briefing = await Briefing.findByIdAndDelete(id);

    if (!briefing) {
      return NextResponse.json(
        { success: false, message: "Briefing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Briefing deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to delete briefing" },
      { status: 500 }
    );
  }
}