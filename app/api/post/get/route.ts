import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Post from "@/models/Post.model";
import mongoose from "mongoose";

export async function GET(req: Request) {

  try {

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid post id" },
          { status: 400 }
        );
      }

      const post = await Post.findById(id).populate("ipfId");

      if (!post) {
        return NextResponse.json(
          { success: false, message: "Post not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: post
      });

    }

    const posts = await Post.find()
      .populate("ipfId")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: posts.length,
      data: posts
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch posts" },
      { status: 500 }
    );

  }

}