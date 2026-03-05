import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/Officer.model";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const officer = await Officer.findById(id);

      return NextResponse.json(officer);
    }

    const officer = await Officer.find();

    return NextResponse.json(officer);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to get officer" },
      { status: 500 },
    );
  }
}
