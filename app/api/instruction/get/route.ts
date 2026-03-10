import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Instruction from "@/models/Instruction.model";
import "@/models/Officer.model";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const shift = searchParams.get("shift");
    const active = searchParams.get("active");
    const today = searchParams.get("today");

    let query: any = {};

    if (shift) {
      query.shift = shift;
    }

    if (active) {
      query.active = active === "true";
    }

    if (today === "true") {
      const now = new Date();

      query.validFrom = { $lte: now };
      query.validTo = { $gte: now };
    }

    const instructions = await Instruction.find(query)
      .populate("createdBy", "name rank") // added
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: instructions,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch instructions" },
      { status: 500 },
    );
  }
}
