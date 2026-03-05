import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Officer from "@/models/Officer.model";

export async function DELETE(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Officer ID required" }, { status: 400 });
    }

    await Officer.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Officer deleted successfully",
    });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to delete officer" },
      { status: 500 },
    );
  }
}
