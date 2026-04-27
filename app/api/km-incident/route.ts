import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import KmIncident from "@/models/kmIncident.model";
import KmPost from "@/models/kmPost.model";

/* -------------------- GET -------------------- */
export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);

    const section = searchParams.get("section");
    const startKm = Number(searchParams.get("startKm"));
    const endKm = Number(searchParams.get("endKm"));

    if (!section) {
      const incidents = await KmIncident.find().sort({
        date_of_occurrence: -1,
      });
      return NextResponse.json({ success: true, data: incidents });
    }

    if (!section || isNaN(startKm) || isNaN(endKm)) {
      return NextResponse.json(
        { success: false, message: "Invalid params" },
        { status: 400 },
      );
    }

    const kmPosts = await KmPost.find({
      section,
      km_number: { $gte: startKm, $lte: endKm },
    })
      .sort({ km_number: 1 })
      .lean();

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

    const incidentMap = new Map<number, Record<string, number>>();

    incidents.forEach((item: any) => {
      const kmKey = Math.floor(Number(item._id)); // 🔴 use floor

      const typesMap: Record<string, number> = {};

      item.incidentList.forEach((i: any) => {
        typesMap[i.type] = i.count;
      });

      incidentMap.set(kmKey, typesMap);
    });

    const result = kmPosts.map((kmPost: any) => {
      const kmKey = Math.floor(Number(kmPost.km_number));

      return {
        km: kmPost.km_number,
        lat: kmPost.latitude,
        lng: kmPost.longitude,
        incidents: incidentMap.get(kmKey) || {},
      };
    });
    console.log(result);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();

    const {
      section,
      track_km,
      incident_type,
      description,
      date_of_occurrence,
      rpf_post,
      division,
    } = body;

    // 🔴 validation
    if (
      !section ||
      track_km === undefined ||
      !incident_type ||
      !date_of_occurrence ||
      !rpf_post ||
      !division
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const incident = await KmIncident.create({
      section,
      track_km: Number(track_km),
      incident_type,
      description: description || "",
      date_of_occurrence: new Date(date_of_occurrence),
      rpf_post,
      division,
    });

    return NextResponse.json(
      { success: true, data: incident },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
