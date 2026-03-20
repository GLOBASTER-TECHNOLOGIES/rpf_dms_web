import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/Officer.model";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const postCode = searchParams.get("postCode");
    const forceNumber = searchParams.get("forceNumber"); // ✅ Added this

    // 1. Fetch single officer by ID
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid ID" },
          { status: 400 },
        );
      }
      const officer = await Officer.findById(id);
      return NextResponse.json({ success: true, data: officer });
    }

    // 2. Fetch single officer by Force Number ✅
    // inside your GET function in api/officer/get/route.ts
    if (forceNumber) {
      const officer = await Officer.findOne({
        forceNumber: forceNumber.trim().toUpperCase(),
      });

      if (!officer) {
        return NextResponse.json(
          { success: false, message: "Officer not found" },
          { status: 404 },
        );
      }

      // ✅ Wrap in 'data' so the frontend knows exactly where to look
      return NextResponse.json({
        success: true,
        data: officer,
      });
    }

    // 3. Build Query for listing
    const query: any = {};
    if (postCode) {
      query.postCode = postCode.toUpperCase();
    }

    const officers = await Officer.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: officers.length,
      data: officers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
