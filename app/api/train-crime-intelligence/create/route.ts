import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TrainCrimeIntelligence from "@/models/TrainCrimeIntelligence";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const data = await TrainCrimeIntelligence.create(body);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
