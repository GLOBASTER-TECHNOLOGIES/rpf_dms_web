import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Shift from "@/models/ShiftDetails.model";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Await params if using Next.js 15
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    console.log("Attempting to update shift with ID:", id); // Check terminal logs

    const body = await req.json();

    // Use findByIdAndUpdate - ensure 'id' is a valid MongoDB ObjectId string
    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      { $set: body },
      {
        returnDocument: "after", // Fixes the Mongoose deprecation warning
        runValidators: true,
      },
    ).populate("officers");

    if (!updatedShift) {
      console.error("Shift not found for ID:", id);
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
