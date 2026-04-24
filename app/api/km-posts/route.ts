import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import KmPost from "@/models/kmPost.model";

// GET: Fetch all posts
export async function GET() {
  await dbConnect();
  try {
    const posts = await KmPost.find({}).populate("captured_by", "name");
    return NextResponse.json({ success: true, data: posts }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

// POST: Create a new post
export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const post = await KmPost.create(body);
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
