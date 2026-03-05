import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/Officer.model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const officer = await Officer.create(body);

    return NextResponse.json(
      {
        success: true,
        data: officer,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
      },
      { status: 500 },
    );
  }
}
