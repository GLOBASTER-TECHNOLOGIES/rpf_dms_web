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

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    } catch {
      // Token expired or malformed — clear cookies and force re-login
      return clearAndUnauthorize("Refresh token expired or invalid");
    }

    let user;
    if (decoded.role === "officer") {
      user = await Officer.findById(decoded.id).select("+refreshToken");
    } else if (decoded.role === "post") {
      user = await Post.findById(decoded.id).select("+refreshToken");
    }

    if (!user) {
      return clearAndUnauthorize("User not found");
    }

    // ⚠️ Token mismatch — another device logged in and overwrote the DB token
    // Clear DB token + cookies and force re-login
    if (user.refreshToken !== refreshToken) {
      if (decoded.role === "officer") {
        await Officer.findByIdAndUpdate(decoded.id, { refreshToken: null });
      } else {
        await Post.findByIdAndUpdate(decoded.id, { refreshToken: null });
      }
      return clearAndUnauthorize("Session conflict detected. Please log in again.");
    }

    const newAccessToken = generateAccessToken(user._id.toString(), decoded.role);

    return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });

  } catch (error) {
    console.error("Refresh error:", error);
    return clearAndUnauthorize("Server error");
  }
}

function clearAndUnauthorize(message: string) {
  const response = NextResponse.json(
    { success: false, message },
    { status: 401 }, // 401 so proxy knows to redirect to /login, not retry
  );
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  return response;
}