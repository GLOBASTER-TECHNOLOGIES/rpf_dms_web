import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Circular from "@/models/Circular.model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      title,
      content,
      priority,
      activeFrom,
      activeTo,
      targetPosts,
      issuedBy,
    } = body;

    if (!title || !content || !activeFrom || !activeTo) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const circular = await Circular.create({
      title,
      content,
      priority,
      activeFrom,
      activeTo,
      targetPosts,
      issuedBy,
    });

    return NextResponse.json(
      { success: true, data: circular },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to create circular" },
      { status: 500 }
    );
  }
}