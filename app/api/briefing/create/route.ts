import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Briefing from "@/models/Briefing.model";
import Officer from "@/models/Officer.model";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // 1. EXTRACT TOKEN (Cookies for Web, Auth Header for Mobile)
    let token = req.cookies.get("accessToken")?.value;
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    // 2. VERIFY TOKEN
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token." },
        { status: 401 },
      );
    }

    // 3. GET OFFICER DETAILS
    const officer = await Officer.findById(decoded.id);
    if (!officer || !officer.active) {
      return NextResponse.json(
        { success: false, message: "Officer not found or account inactive." },
        { status: 401 },
      );
    }

    // 4. PARSE BODY
    const body = await req.json();
    const { post, shift, dutyDate, briefingScript } = body;

    // Validation
    if (!post || !shift || !dutyDate || !briefingScript) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: post, shift, dutyDate, or briefingScript",
        },
        { status: 400 },
      );
    }

    // 5. SAVE TO DATABASE
    const briefing = await Briefing.create({
      createdByOfficerId: officer._id,
      post,
      shift,
      dutyDate: new Date(dutyDate), // Ensure it's stored as a Date object
      briefingScript, // This is the text from your CreateBriefing textarea
    });

    return NextResponse.json(
      {
        success: true,
        message: "Briefing script saved successfully",
        data: briefing,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Briefing Save Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
