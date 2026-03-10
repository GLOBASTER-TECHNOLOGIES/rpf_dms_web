import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Officer from "@/models/Officer.model";
import connectDB from "@/config/dbConnect";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Extract token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Not authorized, no token" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as any;

    const officer = await Officer.findById(decoded.id).select(
      "-password -refreshToken",
    );

    if (!officer || !officer.active) {
      return NextResponse.json(
        { message: "Not authorized, officer inactive or not found" },
        { status: 401 },
      );
    }

    return NextResponse.json({ officer }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Not authorized, token failed" },
      { status: 401 },
    );
  }
}
