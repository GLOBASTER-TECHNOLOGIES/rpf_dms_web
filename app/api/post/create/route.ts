import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/config/dbConnect";
import Post from "@/models/Post.model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const { postCode, division, password, ipfId, contactNumber, address } =
      body;

    if (!postCode || !division) {
      return NextResponse.json(
        { success: false, message: "postCode and division are required" },
        { status: 400 },
      );
    }

    const existingPost = await Post.findOne({ postCode });

    if (existingPost) {
      return NextResponse.json(
        { success: false, message: "Post already exists" },
        { status: 409 },
      );
    }

    // Default password
    const plainPassword = password || "111111";

    // Hash password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const post = await Post.create({
      postCode: postCode.toUpperCase(),
      division: division.toUpperCase(),
      password: hashedPassword,
      ipfId,
      contactNumber,
      address,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Post created successfully",
        data: post,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create post" },
      { status: 500 },
    );
  }
}
