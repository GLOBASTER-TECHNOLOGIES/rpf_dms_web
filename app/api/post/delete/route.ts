import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Post from "@/models/Post.model";
import mongoose from "mongoose";

export async function DELETE(req: Request) {

  try {

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

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

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to delete post" },
      { status: 500 }
    );

  }

}