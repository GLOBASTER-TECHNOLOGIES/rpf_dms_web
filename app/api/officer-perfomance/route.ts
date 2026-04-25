import { NextRequest, NextResponse } from "next/server";
import Officer from "@/models/Officer.model";
import Debrief from "@/models/Debrief.model";
import dbConnect from "@/config/dbConnect";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const forceNumber = searchParams.get("forceNumber");
    const timeframe = searchParams.get("timeframe") || "30";

    if (!forceNumber) {
      return NextResponse.json(
        { success: false, message: "Missing forceNumber parameter" },
        { status: 400 },
      );
    }

    // 1. Fetch full Officer details (Not just ID anymore)
    const officer = await Officer.findOne({ forceNumber })
      .select("_id name forceNumber rank division postCode role")
      .lean();

    if (!officer) {
      return NextResponse.json(
        { success: false, message: "Officer not found" },
        { status: 404 },
      );
    }

    // 2. Build the Match Stage
    const matchStage: any = { staffId: officer._id };

    if (timeframe !== "all") {
      const days = parseInt(timeframe, 10) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      matchStage.date = { $gte: startDate };
    }

    // 3. Run parallel aggregations for Timeline AND Shift Breakdown
    const [timelineData, shiftData] = await Promise.all([
      // Aggregation 1: Timeline (By Date)
      Debrief.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            reportCount: { $sum: { $size: "$reports" } },
          },
        },
        { $project: { _id: 0, date: "$_id", reportCount: 1 } },
        { $sort: { date: 1 } },
      ]),

      // Aggregation 2: Distribution by Shift
      Debrief.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$shift",
            reportCount: { $sum: { $size: "$reports" } },
          },
        },
        { $project: { _id: 0, shift: "$_id", reportCount: 1 } },
        { $sort: { reportCount: -1 } },
      ]),
    ]);

    // Calculate total reports quickly
    const totalReports = timelineData.reduce(
      (sum, item) => sum + item.reportCount,
      0,
    );

    // 4. Return a structured dashboard object
    return NextResponse.json(
      {
        success: true,
        data: {
          officer,
          stats: { totalReports },
          timeline: timelineData,
          shiftBreakdown: shiftData,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in performance API:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
