import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Instruction from "@/models/Instruction.model";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    );

    const validFrom = new Date(body.validFrom);
    const validTo = new Date(body.validTo);

    // Ensure full day coverage
    validFrom.setHours(0, 0, 0, 0);
    validTo.setHours(23, 59, 59, 999);

    const instruction = await Instruction.create({
      ...body,
      validFrom,
      validTo,
      createdBy: decoded.id,
    });

    return NextResponse.json({
      success: true,
      data: instruction,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}