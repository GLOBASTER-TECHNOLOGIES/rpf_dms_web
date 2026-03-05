import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Post from "@/models/Post.model";
import mongoose from "mongoose";

export async function PUT(req: Request) {

  try {

    await dbConnect();

    const body = await req.json();

    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Post ID required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid post id" },
        { status: 400 }
      );
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedPost) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPost
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to update post" },
      { status: 500 }
    );

  }

}