import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Section from "@/models/drop-down/sectionDropDown.model";

// GET
export async function GET() {
  try {
    await dbConnect();

    const sections = await Section.find().sort({ createdAt: -1 });

    return NextResponse.json({ data: sections }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const normalizedCode = body.sectionCode?.toUpperCase().trim();
    const normalizedPost = body.post?.toUpperCase().trim();

    if (!normalizedCode) {
      return NextResponse.json(
        { error: "Section Code is required" },
        { status: 400 },
      );
    }

    const existingSection = await Section.findOne({
      sectionCode: normalizedCode,
    });

    if (existingSection) {
      return NextResponse.json(
        { error: "This Section Code already exists" },
        { status: 400 },
      );
    }

    const newSection = await Section.create({
      post: normalizedPost,
      sectionCode: normalizedCode,
      type: body.type || "MAIN",
    });

    return NextResponse.json(
      {
        message: "Section created successfully",
        data: newSection,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
