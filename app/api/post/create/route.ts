import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Post from "@/models/Post.model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const { postCode, division, password, ipfId, contactNumber, address } =
      body;

    if (!postCode || !division || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
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

    const post = await Post.create({
      postCode,
      division,
      password,
      ipfId,
      contactNumber,
      address,
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to create post" },
      { status: 500 },
    );
  }
}
