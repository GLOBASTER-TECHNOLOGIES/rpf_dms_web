import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Officer from "@/models/Officer.model"; // Adjust the import path to your model
import connectDB from "@/config/dbConnect"; // Adjust path to your database connection utility

const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { forceNumber, password } = body;

    const officer = await Officer.findOne({ forceNumber }).select("+password");
    if (!officer || !officer.active) {
      return NextResponse.json(
        { message: "Invalid credentials or account inactive" },
        { status: 401 },
      );
    }

    const isMatch = await bcrypt.compare(password, officer.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const accessToken = generateAccessToken(officer.id);
    const refreshToken = generateRefreshToken(officer.id);

    officer.refreshToken = refreshToken;
    await officer.save();

    return NextResponse.json(
      {
        message: "Login successful",
        accessToken,
        refreshToken,
        officer: {
          id: officer.id,
          name: officer.name,
          forceNumber: officer.forceNumber,
          rank: officer.rank,
          role: officer.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 },
    );
  }
}
