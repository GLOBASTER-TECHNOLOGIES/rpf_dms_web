import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Section from "@/models/drop-down/sectionDropDown.model";
import { getAuth } from "@/config/getAuth";

/**
 * GET: Retrieve all sections
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuth(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sorted by Post then Section Code for better UI organization
    const sections = await Section.find().sort({ createdAt: -1 });
    return NextResponse.json({ data: sections }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Create a new section
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuth(req);

    // Permission check matching your existing logic
    if (!user || (user.role !== "ADMIN" && user.appRole !== "IPF")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { post, sectionCode, type } = body;

    // Normalizing code for consistent lookups
    const normalizedCode = sectionCode?.toUpperCase().trim();

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
      post: post?.toUpperCase().trim(),
      sectionCode: normalizedCode,
      type: type || "MAIN",
    });

    return NextResponse.json(
      { message: "Section created", data: newSection },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
