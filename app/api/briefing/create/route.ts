import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/config/dbConnect";
import Briefing from "@/models/Briefing.model";
import Officer from "@/models/Officer.model";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    let token = req.cookies.get("accessToken")?.value;

    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    );

    const officer = await Officer.findById(decoded.id);

    if (!officer || !officer.active) {
      return NextResponse.json(
        { success: false, message: "Officer not valid" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const { post, shift, dutyDate, briefingScript } = body;

    if (!post || !shift || !dutyDate || !briefingScript) {
      return NextResponse.json(
        { success: false, message: "All fields required" },
        { status: 400 },
      );
    }

    const parsedDate = new Date(dutyDate);

    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid dutyDate" },
        { status: 400 },
      );
    }

    const briefing = await Briefing.create({
      createdByOfficerId: officer._id,
      post,
      shift,
      dutyDate: parsedDate,
      briefingScript,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Briefing created successfully",
        data: briefing,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 },
    );
  }
}
