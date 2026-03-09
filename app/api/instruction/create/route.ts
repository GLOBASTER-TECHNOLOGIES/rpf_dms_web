import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Instruction from "@/models/Instruction.model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const instruction = await Instruction.create(body);

    return NextResponse.json({
      success: true,
      data: instruction,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create instruction" },
      { status: 500 }
    );
  }
}