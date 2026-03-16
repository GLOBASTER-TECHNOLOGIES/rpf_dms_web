import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Officer from "@/models/Officer.model";
import Post from "@/models/Post.model";
import connectDB from "@/config/dbConnect";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

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
    ) as { id: string; role: "officer" | "post" };

    let user;

    if (decoded.role === "officer") {
      user = await Officer.findById(decoded.id).select(
        "-password -refreshToken",
      );

      if (!user || !user.active) {
        return NextResponse.json(
          { message: "Not authorized, officer inactive or not found" },
          { status: 401 },
        );
      }

      return NextResponse.json({ officer: user }, { status: 200 });
    }

    if (decoded.role === "post") {
      user = await Post.findById(decoded.id).select("-password -refreshToken");

      if (!user) {
        return NextResponse.json(
          { message: "Not authorized, post not found" },
          { status: 401 },
        );
      }

      return NextResponse.json({ post: user }, { status: 200 });
    }

    return NextResponse.json(
      { message: "Invalid token role" },
      { status: 401 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Not authorized, token failed" },
      { status: 401 },
    );
  }
}
