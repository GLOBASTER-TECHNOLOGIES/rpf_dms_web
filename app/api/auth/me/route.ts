import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Officer from "@/models/Officer.model";
import Post from "@/models/Post.model";
import connectDB from "@/config/dbConnect";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authorized, no token" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as { id: string; role: "officer" | "post" };

    if (decoded.role === "officer") {
      const officer = await Officer.findById(decoded.id).select(
        "-password -refreshToken",
      );

      if (!officer || !officer.active) {
        return NextResponse.json(
          { message: "Officer inactive or not found" },
          { status: 401 },
        );
      }

      return NextResponse.json({ officer });
    }

    if (decoded.role === "post") {
      const post = await Post.findById(decoded.id).select(
        "-password -refreshToken",
      );

      if (!post) {
        return NextResponse.json(
          { message: "Post not found" },
          { status: 401 },
        );
      }

      return NextResponse.json({ post });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Not authorized, token failed" },
      { status: 401 },
    );
  }
}
