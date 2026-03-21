import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";

import Shift from "@/models/ShiftDetails.model";
import InstructionModel from "@/models/Instruction.model";
import DebriefModel from "@/models/Debrief.model";
import ThreatCalendar from "@/models/ThreatCalendar.model";
import TrainSchedule from "@/models/TrainSchedule";
import TrainCrimeIntelligence from "@/models/TrainCrimeIntelligence";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function getShiftBounds(dateStr: string, shiftName: string) {
  const istMidnightUTC = new Date(dateStr).getTime() - IST_OFFSET_MS;

  let startMinutes: number;
  let endMinutes: number;

  if (shiftName === "Morning") {
    startMinutes = 6 * 60;
    endMinutes = 14 * 60;
  } else if (shiftName === "Afternoon") {
    startMinutes = 14 * 60;
    endMinutes = 22 * 60;
  } else {
    startMinutes = 22 * 60;
    endMinutes = (24 + 6) * 60;
  }

  return {
    shiftStart: new Date(istMidnightUTC + startMinutes * 60 * 1000),
    shiftEnd: new Date(istMidnightUTC + endMinutes * 60 * 1000),
  };
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const shiftName = searchParams.get("shift");
    const post = searchParams.get("post");

    if (!date || !shiftName || !post) {
      return NextResponse.json(
        { success: false, message: "Missing query params" },
        { status: 400 },
      );
    }

    const { shiftStart, shiftEnd } = getShiftBounds(date, shiftName);
    const shiftKey = shiftName.toLowerCase();

    // 1. Shift
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const shift = await Shift.findOne({
      shiftName,
      shiftDate: { $gte: dayStart, $lte: dayEnd },
      post: post.toUpperCase(),
    })
      .populate({
        path: "briefingDocument",
        select: "briefingScript post shift dutyDate",
      })
      .populate("instructions")
      .populate("officers");

    // 2. Instructions
    const validInstructions = await InstructionModel.find({
      validFrom: { $lte: shiftEnd },
      validTo: { $gte: shiftStart },
      $or: [{ shift: shiftKey }, { shift: "all" }],
    });

    // 3. Debriefs — populate staffId, reports array is embedded
    const debriefs = await DebriefModel.find({
      shift: shiftName,
      date: { $gte: shiftStart, $lte: shiftEnd },
    })
      .populate({ path: "staffId", select: "name forceNumber rank" })
      .lean();

    // 4. Threats
    const threats = await ThreatCalendar.find({
      startDate: { $lte: shiftEnd },
      endDate: { $gte: shiftStart },
    });

    // 5. Trains
    const allTrains = await TrainSchedule.find(
      {},
      "trainNumber arrivalTime trainName platform",
    );

    const trainsInShift = allTrains.filter((train) => {
      if (!train.arrivalTime?.includes(":")) return false;
      const [h, m] = train.arrivalTime.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return false;
      const arrivalUTC =
        new Date(date).getTime() - IST_OFFSET_MS + (h * 60 + m) * 60 * 1000;
      return (
        arrivalUTC >= shiftStart.getTime() && arrivalUTC <= shiftEnd.getTime()
      );
    });

    // 6. Crime Intel
    const crimeIntel = await TrainCrimeIntelligence.find({
      trainNumber: { $in: trainsInShift.map((t) => t.trainNumber) },
    });

    // 7. Flatten debrief reports for easy rendering
    //    Each entry = one train report, with officer info attached
    const debriefReports = debriefs.flatMap((d) =>
      (d.reports ?? []).map((r: any) => ({
        ...r,
        officer: d.staffId, // populated officer object
        debriefId: d._id,
        shift: d.shift,
        approved: d.approved,
      })),
    );

    const data = {
      _id: shift?._id,
      shiftName: shift?.shiftName || shiftName,
      shiftDate: date,
      post: shift?.post || post,
      briefingDocument: shift?.briefingDocument || null,
      officers: shift?.officers || [],
      instructions: validInstructions || [],
      debriefs, // raw debrief docs (one per officer per shift)
      debriefReports, // flattened individual train reports
      threats: threats || [],
      trains: trainsInShift || [],
      crimeIntel: crimeIntel || [],
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("SHIFT REPORT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
