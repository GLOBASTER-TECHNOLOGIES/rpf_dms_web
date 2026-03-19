import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TrainCrimeIntelligence from "@/models/TrainCrimeIntelligence";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    let data;

    // Check if the payload is an array (Bulk Upload)
    if (Array.isArray(body)) {
      // Use insertMany for optimized bulk insertion
      data = await TrainCrimeIntelligence.insertMany(body);
    } else {
      // Handle the standard Single Entry
      data = await TrainCrimeIntelligence.create(body);
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    // If a trainNumber already exists, Mongoose throws a duplicate key error (code 11000).
    // This makes the error message slightly more readable for the frontend.
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more Train Numbers already exist in the database.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}
