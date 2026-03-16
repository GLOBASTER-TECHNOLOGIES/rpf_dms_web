import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/Officer.model";
import bcrypt from "bcryptjs"; // Make sure you have bcryptjs installed

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    // Removed password from destructuring since we are hardcoding it
    const { name, forceNumber, rank, role, postCode, division } = body;

    if (!name || !forceNumber || !rank || !role || !postCode || !division) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingOfficer = await Officer.findOne({ forceNumber });

    if (existingOfficer) {
      return NextResponse.json(
        { success: false, message: "Force number already exists" },
        { status: 409 },
      );
    }

    // 1. Generate salt and hash the default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("111111", salt);

    // 2. Create the officer with the hashed password
    const officer = await Officer.create({
      name,
      forceNumber,
      rank,
      role,
      postCode,
      division,
      password: hashedPassword,
    });

    // 3. Exclude the password from the response data for security
    const officerResponse = {
      _id: officer._id,
      name: officer.name,
      forceNumber: officer.forceNumber,
      rank: officer.rank,
      role: officer.role,
      postCode: officer.postCode,
      division: officer.division,
      active: officer.active,
    };

    return NextResponse.json(
      {
        success: true,
        data: officerResponse,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to create officer" },
      { status: 500 },
    );
  }
}
