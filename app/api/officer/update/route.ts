import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/Officer.model";
import mongoose from "mongoose";

export async function PUT(req: Request) {

  try {

    await dbConnect();

    const body = await req.json();

    const { id, ...updateData } = body;

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

    const updatedOfficer = await Officer.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedOfficer) {
      return NextResponse.json(
        { success: false, message: "Officer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedOfficer
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update officer" },
      { status: 500 }
    );

  }

}