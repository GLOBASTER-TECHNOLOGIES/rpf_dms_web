import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/Officer.model";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Officer ID required" }, { status: 400 });
    }

    const updatedOfficer = await Officer.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(updatedOfficer);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update officer" },
      { status: 500 },
    );
  }
}
