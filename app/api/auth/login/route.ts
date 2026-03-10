import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Officer from "@/models/Officer.model";
import connectDB from "@/config/dbConnect";

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

    if (!forceNumber || !password) {
      return NextResponse.json(
        { success: false, message: "Force number and password are required" },
        { status: 400 }
      );
    }

    const officer = await Officer.findOne({ forceNumber })
      .select("+password")
      .lean();

    if (!officer || !officer.active) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials or account inactive" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, officer.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate Tokens
    const accessToken = generateAccessToken(officer._id.toString());
    const refreshToken = generateRefreshToken(officer._id.toString());

    // Save refresh token
    await Officer.findByIdAndUpdate(officer._id, { refreshToken });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",

        officer: {
          id: officer._id,
          name: officer.name,
          forceNumber: officer.forceNumber,
          rank: officer.rank,
          role: officer.role,
        },

        // IMPORTANT: return tokens for mobile apps
        accessToken,
        refreshToken,
      },
      { status: 200 }
    );

    // Cookie for web dashboard
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}