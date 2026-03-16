import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Officer from "@/models/Officer.model";
import Post from "@/models/Post.model";
import connectDB from "@/config/dbConnect";

const generateAccessToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "15m",
  });
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token required" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as any;

    let user;

    if (decoded.role === "officer") {
      user = await Officer.findById(decoded.id).select("+refreshToken");
    }

    if (decoded.role === "post") {
      user = await Post.findById(decoded.id).select("+refreshToken");
    }

    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 403 },
      );
    }

    const newAccessToken = generateAccessToken(
      user._id.toString(),
      decoded.role,
    );

    return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid or expired refresh token" },
      { status: 403 },
    );
  }
}
