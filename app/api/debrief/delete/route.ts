import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Debrief from "@/models/Debrief.model";
import connectDB from "@/config/dbConnect";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);

    const { id } = await req.json();

    await Debrief.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Debrief deleted",
    });
  } catch (error) {
    console.error("DELETE DEBRIEF ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}