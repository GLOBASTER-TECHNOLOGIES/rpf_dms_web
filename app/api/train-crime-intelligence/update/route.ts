import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TrainCrimeIntelligence from "@/models/TrainCrimeIntelligence";

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const data = await TrainCrimeIntelligence.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}