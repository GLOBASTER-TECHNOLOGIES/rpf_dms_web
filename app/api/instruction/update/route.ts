import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Instruction from "@/models/Instruction.model";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: "Instruction ID is required" },
        { status: 400 },
      );
    }

    const instruction = await Instruction.findByIdAndUpdate(_id, updateData, {
      returnDocument: "after", // replaces deprecated new:true
      runValidators: true,
    });
    console.log(instruction);
    if (!instruction) {
      return NextResponse.json(
        { success: false, message: "Instruction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: instruction,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update instruction" },
      { status: 500 },
    );
  }
}
