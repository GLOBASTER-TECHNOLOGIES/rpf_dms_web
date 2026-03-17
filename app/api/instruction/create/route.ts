import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Instruction from "@/models/Instruction.model";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import admin from "@/config/firebaseAdmin";
import Officer from "@/models/Officer.model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    console.log(body);
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    );

    const validFrom = new Date(body.validFrom);
    const validTo = new Date(body.validTo);

    validFrom.setHours(0, 0, 0, 0);
    validTo.setHours(23, 59, 59, 999);

    const instruction = await Instruction.create({
      ...body,
      validFrom,
      validTo,
      createdBy: decoded.id,
    });

    // =========================
    // 🔔 SEND NOTIFICATIONS TO ALL OFFICERS
    // =========================
    try {
      // ✅ Get all officers with tokens
      const officers = await Officer.find({
        fcmToken: { $ne: null },
      }).select("fcmToken");

      const tokens: string[] = officers
        .map((o) => o.fcmToken)
        .filter((t): t is string => !!t && t.length > 0);

      if (tokens.length === 0) {
        console.log("No FCM tokens found");
      } else {
        // 🔥 Send multicast notification
        const response = await admin.messaging().sendEachForMulticast({
          tokens,

          notification: {
            title: body.title,
            body: body.instruction || "A new instruction has been issued",
          },

          data: {
            type: "instruction",
            instructionId: instruction._id.toString(),
          },

          android: {
            priority: "high",
            notification: {
              channelId: "high_importance_channel",
            },
          },
        });

        // ✅ Clean invalid tokens (VERY IMPORTANT)
        const invalidTokens: string[] = [];

        response.responses.forEach((res, idx) => {
          if (!res.success) {
            console.log("Failed token:", tokens[idx], res.error);
            invalidTokens.push(tokens[idx]);
          }
        });

        if (invalidTokens.length > 0) {
          await Officer.updateMany(
            { fcmToken: { $in: invalidTokens } },
            { $set: { fcmToken: null } },
          );
        }
      }
    } catch (err) {
      console.error("Notification Error:", err);
    }

    return NextResponse.json({
      success: true,
      data: instruction,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
