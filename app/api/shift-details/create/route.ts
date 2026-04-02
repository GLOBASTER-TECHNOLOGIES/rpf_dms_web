import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Shift from "@/models/ShiftDetails.model";
import Officer from "@/models/Officer.model";
import Briefing from "@/models/Briefing.model";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const cookieToken = req.cookies.get("accessToken")?.value;
    const authHeader = req.headers.get("Authorization") ?? "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    const token = cookieToken ?? bearerToken;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authorized, no token" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as { id: string; role: "officer" | "post" };

    if (decoded.role !== "officer") {
      return NextResponse.json(
        { success: false, message: "Only officers can create shifts" },
        { status: 403 },
      );
    }

    const officer = await Officer.findById(decoded.id).select(
      "-password -refreshToken",
    );

    if (!officer || !officer.active) {
      return NextResponse.json(
        { success: false, message: "Officer inactive or not found" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { shiftName, officers } = body; // Notice we ignore shiftDate from body

    if (!shiftName || !officers?.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: shiftName, officers",
        },
        { status: 400 },
      );
    }

    // --- SERVER TIME LOGIC (IST) ---
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);

    let year = istTime.getUTCFullYear();
    let month = istTime.getUTCMonth();
    let day = istTime.getUTCDate();
    const istHour = istTime.getUTCHours();

    // Night Shift Fix: If before 6 AM IST, it belongs to yesterday
    if (istHour < 6 && shiftName === "Night") {
      day = day - 1;
    }

    // Lock to strict UTC Midnight
    const standardizedUTCDate = new Date(
      Date.UTC(year, month, day, 0, 0, 0, 0),
    );

    const briefing = await Briefing.findOne({
      post: officer.postCode.trim().toUpperCase(),
      shift: shiftName.trim(),
    })
      .sort({ dutyDate: -1 })
      .lean();

    if (!briefing) {
      return NextResponse.json(
        {
          success: false,
          message: `No briefing found for post ${officer.postCode}, ${shiftName} shift. Please generate a briefing first.`,
        },
        { status: 404 },
      );
    }

    const shift = await Shift.create({
      shiftName: shiftName.trim(),
      shiftDate: standardizedUTCDate, // Use server date
      post: officer.postCode.trim().toUpperCase(),
      briefingDocument: briefing._id,
      officers,
      createdBy: officer._id,
    });

    return NextResponse.json({ success: true, data: shift }, { status: 201 });
  } catch (error: any) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return NextResponse.json(
        { success: false, message: "Not authorized, token failed" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
