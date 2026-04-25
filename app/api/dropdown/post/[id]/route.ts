import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import postDropdownModel from "@/models/drop-down/postDropdown.model";

// UPDATE
export async function PUT(req: NextRequest, { params }: any) {
  try {
    await dbConnect();

    const { id } = await params;

    const body = await req.json();
    const updateData: any = {};

    if (body.postCode) {
      updateData.postCode = body.postCode.toUpperCase().trim();
    }

    if (body.postType) {
      updateData.postType = body.postType;
    }

    const updatedPost = await postDropdownModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        returnDocument: "after", // FIX for mongoose warning
        runValidators: true,
      },
    );

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Post Code already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    await dbConnect();

    const { id } = await params;

    const deleted = await postDropdownModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
