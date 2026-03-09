import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Instruction from "@/models/Instruction.model";

export async function DELETE(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await Instruction.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Instruction deleted successfully",
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete instruction" },
      { status: 500 }
    );
  }
}