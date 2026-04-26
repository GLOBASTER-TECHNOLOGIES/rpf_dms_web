import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import KmIncident from "@/models/kmIncident.model";

type RouteParams = { params: Promise<{ id: string }> };

// GET: Fetch a single incident
export async function GET(request: NextRequest, { params }: RouteParams) {
  await dbConnect();
  const { id } = await params;

  try {
    const incident = await KmIncident.findById(id);
    if (!incident) {
      return NextResponse.json({ success: false, message: "Incident not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: incident }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PUT: Update an incident
export async function PUT(request: NextRequest, { params }: RouteParams) {
  await dbConnect();
  const { id } = await params;

  try {
    const body = await request.json();
    const incident = await KmIncident.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!incident) {
      return NextResponse.json({ success: false, message: "Incident not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: incident }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE: Remove an incident
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  await dbConnect();
  const { id } = await params;

  try {
    const deletedIncident = await KmIncident.findByIdAndDelete(id);
    
    if (!deletedIncident) {
      return NextResponse.json({ success: false, message: "Incident not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}