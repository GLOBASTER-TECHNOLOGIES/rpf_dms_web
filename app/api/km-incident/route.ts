import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import KmIncident from "@/models/kmIncident.model";
import KmPost from "@/models/kmPost.model";

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);

    const section = searchParams.get("section");
    const startKm = Number(searchParams.get("startKm"));
    const endKm = Number(searchParams.get("endKm"));

    if (!section || isNaN(startKm) || isNaN(endKm)) {
      return NextResponse.json(
        { success: false, message: "Invalid params" },
        { status: 400 },
      );
    }

    // 1. Get KM Posts
    const kmPosts = await KmPost.find({
      section,
      km_number: { $gte: startKm, $lte: endKm },
    })
      .sort({ km_number: 1 })
      .lean();

    // 2. Aggregate Incidents
    const incidents = await KmIncident.aggregate([
      {
        $match: {
          section,
          track_km: { $gte: startKm, $lte: endKm },
        },
      },
      {
        $group: {
          _id: {
            km: "$track_km",
            type: "$incident_type",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.km",
          incidentList: {
            $push: {
              type: "$_id.type",
              count: "$count",
            },
          },
        },
      },
    ]);

    // 3. Convert to Map using String keys to avoid Float precision errors
    // Key: "150.100", Value: { TRESPASSING: 5 }
    const incidentMap = new Map<string, Record<string, number>>();

    incidents.forEach((item: any) => {
      // Round to 3 decimal places to ensure match
      const kmKey = Number(item._id).toFixed(3);
      const typesMap: Record<string, number> = {};

      item.incidentList.forEach((i: any) => {
        typesMap[i.type] = i.count;
      });

      incidentMap.set(kmKey, typesMap);
    });

    // 4. Merge Data
    const result = kmPosts.map((kmPost: any) => {
      const kmKey = Number(kmPost.km_number).toFixed(3);
      return {
        km: kmPost.km_number,
        lat: kmPost.latitude,
        lng: kmPost.longitude,
        // Match using the standardized string key
        incidents: incidentMap.get(kmKey) || {},
      };
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
