import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import AppConfig from "@/models/AppConfig.model";

export async function GET() {
  try {
    await dbConnect();

    let config = await AppConfig.findOne();

    if (!config) {
      config = await AppConfig.create({
        latestVersion: "1.0.0",
        minSupportedVersion: "1.0.0",
        forceUpdate: false,
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch config" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const existing = await AppConfig.findOne();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "AppConfig already exists",
        },
        { status: 400 },
      );
    }

    const body = await req.json();

    const config = await AppConfig.create(body);

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create config" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const config = await AppConfig.findOneAndUpdate({}, body, {
      new: true,
      upsert: true,
    });

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update config" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await dbConnect();

    await AppConfig.deleteMany({}); // ensures all cleared

    return NextResponse.json({
      success: true,
      message: "AppConfig deleted",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete config" },
      { status: 500 },
    );
  }
}
