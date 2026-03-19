import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TrainCrimeIntelligence from "@/models/TrainCrimeIntelligence";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const trainNumber = searchParams.get("trainNumber");
    const riskLevel = searchParams.get("riskLevel");
    const minIncidents = searchParams.get("minIncidents");
    const maxIncidents = searchParams.get("maxIncidents");

    const query: any = {};

    if (trainNumber) {
      query.trainNumber = trainNumber;
      // Optional: partial search
      // query.trainNumber = { $regex: trainNumber, $options: "i" };
    }

    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    if (minIncidents || maxIncidents) {
      query.totalIncidents = {};
      if (minIncidents) query.totalIncidents.$gte = Number(minIncidents);
      if (maxIncidents) query.totalIncidents.$lte = Number(maxIncidents);
    }

    const data = await TrainCrimeIntelligence
      .find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, count: data.length, data },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}