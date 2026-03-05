import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/Officer.model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, forceNumber, rank, role, postCode, division, password } =
      body;

    if (
      !name ||
      !forceNumber ||
      !rank ||
      !role ||
      !postCode ||
      !division ||
      !password
    ) {
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

    const officer = await Officer.create({
      name,
      forceNumber,
      rank,
      role,
      postCode,
      division,
      password,
    });

    return NextResponse.json(
      {
        success: true,
        data: officer,
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
