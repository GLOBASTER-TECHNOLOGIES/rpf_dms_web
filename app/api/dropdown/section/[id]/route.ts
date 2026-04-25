import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Section from "@/models/drop-down/sectionDropDown.model";

// UPDATE
export async function PUT(req: NextRequest, { params }: any) {
  try {
    await dbConnect();

    const { id } = await params;

    const body = await req.json();

    const updateData: any = {};

    if (body.post) {
      updateData.post = body.post.toUpperCase().trim();
    }

    if (body.sectionCode) {
      updateData.sectionCode = body.sectionCode.toUpperCase().trim();
    }

    if (body.type) {
      updateData.type = body.type;
    }

    const updatedSection = await Section.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        returnDocument: "after", // FIX for mongoose warning
        runValidators: true,
      },
    );

    if (!updatedSection) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Updated successfully",
      data: updatedSection,
    });
  } catch (error: any) {
    console.log(error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Section Code already exists" },
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

    const deleted = await Section.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Section deleted successfully",
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
