import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import KmPost from "@/models/kmPost.model";

// GET: Fetch single post
export async function GET(request: NextRequest, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const post = await KmPost.findById(id);
    if (!post) return NextResponse.json({ success: false }, { status: 404 });
    return NextResponse.json({ success: true, data: post }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

// PUT: Update post
export async function PUT(request: NextRequest, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const body = await request.json();
    const post = await KmPost.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!post) return NextResponse.json({ success: false }, { status: 404 });
    return NextResponse.json({ success: true, data: post }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

// DELETE: Remove post
export async function DELETE(request: NextRequest, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const deletedPost = await KmPost.deleteOne({ _id: id });
    if (!deletedPost.deletedCount) {
      return NextResponse.json({ success: false }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
