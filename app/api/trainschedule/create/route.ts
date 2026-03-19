import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import TrainSchedule from "@/models/TrainSchedule";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const dataToProcess = Array.isArray(body.schedules)
      ? body.schedules
      : Array.isArray(body)
        ? body
        : [body];

    const validatedData: any[] = [];
    const failedItems: any[] = [];

    // 1. Separate Good and Bad data
    dataToProcess.forEach((item: any, index: number) => {
      const rowNum = index + 2;
      const missingFields: string[] = [];

      const requiredFields = [
        "trainNumber",
        "trainName",
        "arrivalTime",
        "source",
        "destination",
      ];
      requiredFields.forEach((field) => {
        if (!item[field] || String(item[field]).trim() === "") {
          missingFields.push(field);
        }
      });

      if (!Array.isArray(item.daysOfRun) || item.daysOfRun.length === 0) {
        missingFields.push("daysOfRun");
      }

      if (missingFields.length > 0) {
        // Collect as a failed item
        failedItems.push({
          row: rowNum,
          trainNumber: item.trainNumber || "Unknown",
          error: `Missing: ${missingFields.join(", ")}`,
        });
      } else {
        // Push to valid data array
        validatedData.push({
          trainNumber: String(item.trainNumber).trim(),
          trainName: String(item.trainName).trim(),
          source: String(item.source).toUpperCase().trim(),
          destination: String(item.destination).toUpperCase().trim(),
          arrivalTime: String(item.arrivalTime).trim(),
          departureTime: item.departureTime
            ? String(item.departureTime).trim()
            : undefined,
          platform:
            item.platform !== undefined &&
            item.platform !== null &&
            item.platform !== ""
              ? Number(item.platform)
              : undefined,
          daysOfRun: item.daysOfRun,
        });
      }
    });

    // 2. Database Save (Only if there is valid data)
    let savedCount = 0;
    if (validatedData.length > 0) {
      try {
        // ordered: false allows valid documents to insert even if some hit duplicate key errors
        const result = await TrainSchedule.insertMany(validatedData, {
          ordered: false,
        });
        savedCount = result.length;
      } catch (dbError: any) {
        // If some failed due to duplicate keys (11000), they are still inserted
        savedCount = dbError.insertedDocs?.length || 0;

        // Add duplicate errors to failedItems if you want
        if (dbError.writeErrors) {
          dbError.writeErrors.forEach((we: any) => {
            failedItems.push({
              trainNumber: we.getOperation().trainNumber,
              error: "Train number already exists in database",
            });
          });
        }
      }
    }

    // 3. Return a mixed response
    return NextResponse.json(
      {
        success: true,
        message: `Processed ${savedCount} records successfully. ${failedItems.length} items failed.`,
        savedCount,
        failedCount: failedItems.length,
        failedItems, // This is the list for your frontend to show
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("CRITICAL API ERROR:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error occurred during processing" },
      { status: 500 },
    );
  }
}
