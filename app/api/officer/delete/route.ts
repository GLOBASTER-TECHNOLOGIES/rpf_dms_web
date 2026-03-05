import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/Officer.model";
import mongoose from "mongoose";

export async function DELETE(req: Request) {

  try {

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Officer ID required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid officer id" },
        { status: 400 }
      );
    }

    const officer = await Officer.findByIdAndDelete(id);

    if (!officer) {
      return NextResponse.json(
        { success: false, message: "Officer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Officer deleted successfully"
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to delete officer" },
      { status: 500 }
    );

  }

}