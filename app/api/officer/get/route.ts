import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/Officer.model";
import mongoose from "mongoose";

export async function GET(req: Request) {

  try {

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid officer id" },
          { status: 400 }
        );
      }

      const officer = await Officer.findById(id)
        .populate("postId");

      if (!officer) {
        return NextResponse.json(
          { success: false, message: "Officer not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: officer
      });

    }

    const officers = await Officer.find()
      .populate("postId")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: officers.length,
      data: officers
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch officers" },
      { status: 500 }
    );

  }
}