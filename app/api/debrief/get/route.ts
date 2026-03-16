import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Debrief from "@/models/Debrief.model";
import connectDB from "@/config/dbConnect";
import "@/models/Officer.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as { id: string };

    // GET postcode from query
    const postCode = req.nextUrl.searchParams.get("postCode");

    // Build filter dynamically
    const filter: any = {};

    if (postCode) {
      filter.postCode = postCode;
    }

    const debriefs = await Debrief.find(filter)
      .populate({
        path: "staffId",
        select: "name forceNumber rank",
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log(debriefs);

    return NextResponse.json({
      success: true,
      data: debriefs,
    });
  } catch (error) {
    console.error("GET DEBRIEF ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
