import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import postDropdownModel from "@/models/drop-down/postDropdown.model";

/**
 * GET: Retrieve all posts
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Sorted by postCode alphabetically
    const posts = await postDropdownModel.find({}).sort({ postCode: 1 });
    return NextResponse.json({ data: posts }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Create a new post
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { postCode, postType } = body;

    if (!postCode) {
      return NextResponse.json(
        { error: "Post Code is required" },
        { status: 400 },
      );
    }

    const normalizedCode = postCode.toUpperCase().trim();

    const existingPost = await postDropdownModel.findOne({
      postCode: normalizedCode,
    });
    if (existingPost) {
      return NextResponse.json(
        { error: "This Post Code already exists" },
        { status: 400 },
      );
    }

    const newPost = await postDropdownModel.create({
      postCode: normalizedCode,
      postType: postType,
    });

    return NextResponse.json(
      { message: "Post created successfully", data: newPost },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
