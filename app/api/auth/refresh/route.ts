import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Officer from "@/models/Officer.model";
import connectDB from "@/config/dbConnect";

const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET as string, {
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

    const officer = await Officer.findById(decoded.id).select("+refreshToken");
    if (!officer || officer.refreshToken !== refreshToken) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 403 },
      );
    }

    const newAccessToken = generateAccessToken(officer.id);

    return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid or expired refresh token" },
      { status: 403 },
    );
  }
}
