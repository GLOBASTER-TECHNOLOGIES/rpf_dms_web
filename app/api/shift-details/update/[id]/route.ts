import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Shift from "@/models/ShiftDetails.model";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const body = await req.json();

    // Protect the shiftDate! Prevent the frontend from overwriting the server date
    if (body.shiftDate) {
      delete body.shiftDate;
    }

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      { $set: body },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).populate("officers");

    if (!updatedShift) {
      return NextResponse.json(
        { success: false, message: "Shift not found in database" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedShift });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}