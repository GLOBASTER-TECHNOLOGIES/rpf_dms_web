import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";

import Shift from "@/models/ShiftDetails.model";
import InstructionModel from "@/models/Instruction.model";
import DebriefModel from "@/models/Debrief.model";
import ThreatCalendar from "@/models/ThreatCalendar.model";
import TrainSchedule from "@/models/TrainSchedule";
import TrainCrimeIntelligence from "@/models/TrainCrimeIntelligence";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    //  1. Get query params
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

    const shiftDate = new Date(date);

    // Normalize
    const shiftKey = shiftName.toLowerCase();

    // 🕒 Time Range
    const shiftStart = new Date(shiftDate);
    const shiftEnd = new Date(shiftDate);

    if (shiftName === "Morning") {
      shiftStart.setHours(6, 0, 0, 0);
      shiftEnd.setHours(14, 0, 0, 0);
    } else if (shiftName === "Afternoon") {
      shiftStart.setHours(14, 0, 0, 0);
      shiftEnd.setHours(22, 0, 0, 0);
    } else {
      shiftStart.setHours(22, 0, 0, 0);
      shiftEnd.setDate(shiftEnd.getDate() + 1);
      shiftEnd.setHours(6, 0, 0, 0);
    }

    // ✅ 2. Find Shift
    const shift = await Shift.findOne({
      shiftName,
      shiftDate: {
        $gte: new Date(shiftDate.setHours(0, 0, 0, 0)),
        $lte: new Date(shiftDate.setHours(23, 59, 59, 999)),
      },
      post: post.toUpperCase(),
    })
      .populate({
        path: "briefingDocument",
        select: "briefingScript post shift dutyDate",
      })
      .populate("instructions")
      .populate("officers");

    // Optional: allow empty shift
    // if (!shift) { ... } ← your choice

    // ✅ 3. Instructions
    const validInstructions = await InstructionModel.find({
      validFrom: { $lte: shiftEnd },
      validTo: { $gte: shiftStart },
      $or: [{ shift: shiftKey }, { shift: "all" }],
    });

    // ✅ 4. Debriefs
    const officerIds = shift?.officers || [];

    const debriefs = await DebriefModel.find({
      staffId: { $in: officerIds },
      date: {
        $gte: shiftStart,
        $lte: shiftEnd,
      },
    }).populate("staffId");

    // ✅ 5. Threats
    const threats = await ThreatCalendar.find({
      startDate: { $lte: shiftEnd },
      endDate: { $gte: shiftStart },
    });

    // ✅ 6. Trains
    const trains = await TrainSchedule.find(
      {},
      "trainNumber arrivalTime trainName platform",
    );

    const trainsInShift = trains.filter((train) => {
      if (!train.arrivalTime) return false;
      if (!train.arrivalTime.includes(":")) return false;

      const [h, m] = train.arrivalTime.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return false;

      const arrival = new Date(shiftDate);
      arrival.setHours(h, m, 0, 0);

      return arrival >= shiftStart && arrival <= shiftEnd;
    });

    const trainNumbers = trainsInShift.map((t) => t.trainNumber);

    // ✅ 7. Crime Intel
    const crimeIntel = await TrainCrimeIntelligence.find({
      trainNumber: { $in: trainNumbers },
    });

    // 🎯 Final Response
    return NextResponse.json({
      success: true,
      data: {
        query: { date, shiftName, post },

        shift: shift || null,

        briefing: shift?.briefingDocument || null,

        officers: shift?.officers || [],

        instructions: validInstructions,

        debriefs,

        threats,

        trains: trainsInShift,

        crimeIntel,
      },
    });
  } catch (error) {
    console.error("SHIFT REPORT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
