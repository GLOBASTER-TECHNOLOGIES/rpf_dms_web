import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/Officer.model";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const { id, resetPassword, newPassword, ...updateData } = body;

    /* -------------------------------- */
    /* Validate officer id */
    /* -------------------------------- */

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Officer ID required" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid officer id" },
        { status: 400 },
      );
    }

    /* -------------------------------- */
    /* Prevent conflicting requests */
    /* -------------------------------- */

    if (resetPassword && newPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 },
      );
    }

    const updatePayload: any = { ...updateData };

    /* -------------------------------- */
    /* 🔐 ADMIN RESET PASSWORD */
    /* -------------------------------- */

    if (resetPassword) {
      const hashedPassword = await bcrypt.hash("111111", 10);

      updatePayload.password = hashedPassword;
      updatePayload.mustChangePassword = true;
    }

    /* -------------------------------- */
    /* 🔐 OFFICER SET NEW PASSWORD */
    /* -------------------------------- */

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters" },
          { status: 400 },
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      updatePayload.password = hashedPassword;
      updatePayload.mustChangePassword = false;
    }

    /* -------------------------------- */
    /* Update officer */
    /* -------------------------------- */

    const updatedOfficer = await Officer.findByIdAndUpdate(id, updatePayload, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedOfficer) {
      return NextResponse.json(
        { success: false, message: "Officer not found" },
        { status: 404 },
      );
    }

    /* -------------------------------- */
    /* Success response */
    /* -------------------------------- */

    return NextResponse.json(
      {
        success: true,
        message: "Officer updated successfully",
        data: updatedOfficer,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Officer update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update officer",
      },
      { status: 500 },
    );
  }
}
