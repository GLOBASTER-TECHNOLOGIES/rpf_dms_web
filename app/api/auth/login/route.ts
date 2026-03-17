import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Officer from "@/models/Officer.model";
import Post from "@/models/Post.model";
import connectDB from "@/config/dbConnect";

const generateAccessToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const { identifier, password, isMobile, deviceId, fcmToken } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Identifier and password required" },
        { status: 400 }
      );
    }

    let user: any = null;
    let role: "officer" | "post";

    const isOfficerLogin = /^\d+$/.test(identifier);

    if (isOfficerLogin) {
      role = "officer";

      user = await Officer.findOne({ forceNumber: identifier })
        .select("+password")
        .lean();

      if (!user || !user.active) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid credentials or account inactive",
          },
          { status: 401 }
        );
      }
    } else {
      role = "post";

      user = await Post.findOne({ postCode: identifier })
        .select("+password")
        .lean();

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), role);
    const refreshToken = generateRefreshToken(user._id.toString(), role);

    // =========================
    // 🔥 MOBILE LOGIN LOGIC
    // =========================
    if (isMobile && role === "officer") {
      if (!deviceId || !fcmToken) {
        return NextResponse.json(
          {
            success: false,
            message: "Device ID and FCM token required for mobile login",
          },
          { status: 400 }
        );
      }

      await Officer.findByIdAndUpdate(user._id, {
        refreshToken,
        deviceId,
        fcmToken,
      });
    }

    // =========================
    // 🌐 WEB LOGIN LOGIC
    // =========================
    if (!isMobile) {
      if (role === "officer") {
        await Officer.findByIdAndUpdate(user._id, { refreshToken });
      } else {
        await Post.findByIdAndUpdate(user._id, { refreshToken });
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",

        // ✅ CHANGED HERE
        officer:
          role === "officer"
            ? {
                id: user._id,
                role,
                name: user.name,
                forceNumber: user.forceNumber,
                rank: user.rank,
              }
            : {
                id: user._id,
                role,
                postCode: user.postCode,
                division: user.division,
              },

        accessToken,
        refreshToken,
      },
      { status: 200 }
    );

    // =========================
    // 🍪 WEB COOKIES ONLY
    // =========================
    if (!isMobile) {
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
    }

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}