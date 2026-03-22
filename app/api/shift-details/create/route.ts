import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Shift from "@/models/ShiftDetails.model";
import Officer from "@/models/Officer.model";
import Briefing from "@/models/Briefing.model";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // ── 1. Token: cookie (web) OR Authorization header (mobile) ──
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

    // ── 2. Verify ─────────────────────────────────────────────
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

    // ── 3. Load officer ───────────────────────────────────────
    const officer = await Officer.findById(decoded.id).select(
      "-password -refreshToken",
    );

    if (!officer || !officer.active) {
      return NextResponse.json(
        { success: false, message: "Officer inactive or not found" },
        { status: 401 },
      );
    }

    // ── 4. Parse body ─────────────────────────────────────────
    const body = await req.json();
    const { shiftName, shiftDate, officers } = body;

    // ── 5. Validate ───────────────────────────────────────────
    if (!shiftName || !shiftDate || !officers?.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: shiftName, shiftDate, officers",
        },
        { status: 400 },
      );
    }

    // ── 6. Find matching Briefing doc ─────────────────────────
    // Match on post (from officer), shift (shiftName), and dutyDate (shiftDate).
    // dutyDate is stored as Date so we match the full day range.
    const dutyDateStart = new Date(shiftDate);
    dutyDateStart.setUTCHours(0, 0, 0, 0);
    const dutyDateEnd = new Date(shiftDate);
    dutyDateEnd.setUTCHours(23, 59, 59, 999);

    const briefing = await Briefing.findOne({
      post: officer.postCode,
      shift: shiftName,
    })
      .sort({ dutyDate: -1 })
      .lean();

    if (!briefing) {
      return NextResponse.json(
        {
          success: false,
          message: `No briefing found for post ${officer.postCode}, ${shiftName} shift.`,
        },
        { status: 404 },
      );
    }
    if (!briefing) {
      return NextResponse.json(
        {
          success: false,
          message: `No briefing found for post ${officer.postCode}, ${shiftName} shift on ${shiftDate}. Please generate a briefing first.`,
        },
        { status: 404 },
      );
    }

    // console.log("Shift create →", {
    //   shiftName,
    //   shiftDate,
    //   post: officer.postCode,
    //   briefingDocument: briefing._id,
    //   officers,
    //   createdBy: officer._id,
    // });

    // ── 7. Create shift ───────────────────────────────────────
    const shift = await Shift.create({
      shiftName,
      shiftDate,
      post: officer.postCode, // from DB
      briefingDocument: briefing._id, // auto-resolved
      officers,
      createdBy: officer._id, // from token
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
