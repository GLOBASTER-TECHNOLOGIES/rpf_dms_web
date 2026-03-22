import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Debrief from "@/models/Debrief.model";
import connectDB from "@/config/dbConnect";
import "@/models/Officer.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const cookieToken = req.cookies.get("accessToken")?.value;
    const authHeader = req.headers.get("Authorization") ?? "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const token = cookieToken ?? bearerToken;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);

    const searchParams = req.nextUrl.searchParams;

    const postCode = searchParams.get("postCode");
    const shift = searchParams.get("shift");
    const staffId = searchParams.get("staffId");
    const dateParam = searchParams.get("date");
    const approved = searchParams.get("approved");

    const filter: Record<string, unknown> = {};

    if (postCode) filter.postCode = postCode;
    if (shift) filter.shift = shift;
    if (staffId) filter.staffId = staffId;
    if (approved !== null && approved !== undefined) {
      filter.approved = approved === "true";
    }

    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);
      const istOffsetMs = 5.5 * 60 * 60 * 1000;

      const startIST = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endIST = new Date(year, month - 1, day, 23, 59, 59, 999);

      filter.date = {
        $gte: new Date(startIST.getTime() - istOffsetMs),
        $lte: new Date(endIST.getTime() - istOffsetMs),
      };
    }

    const debriefs = await Debrief.find(filter)
      .populate({ path: "staffId", select: "name forceNumber rank" })
      .sort({ createdAt: -1 })
      .lean();

    const data = debriefs.map((d) => ({
      ...d,
      reportCount: Array.isArray(d.reports) ? d.reports.length : 0,
    }));

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET DEBRIEF ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
