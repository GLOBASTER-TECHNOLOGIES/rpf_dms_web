import { NextResponse } from "next/server";
import dbConnect from "@/config/dbConnect";
import Instruction from "@/models/Instruction.model";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import admin from "@/config/firebaseAdmin";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

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

    // 🔔 SEND NOTIFICATION
    // 🔔 SEND NOTIFICATION (DIRECT TOKEN)
    try {
      const fcmToken =
        "fqyrwcrPTaqvx1hPR4FK8v:APA91bGNHxbuuC1Y0HvMVUJsQ75YulO_cWGEueDu6C3mR4Yf7eCkpEm29bjZ9WsAVmL2IzEdHwIeoChvnHpDPW1YJRXQezMGBAxRML4jpgSZ0748PixzzKc";

      await admin.messaging().send({
        token: fcmToken, // 🔥 direct device

        notification: {
          title: "📢 New Instruction",
          body: body.title || "A new instruction has been issued",
        },

        data: {
          type: "instruction",
          instructionId: instruction._id.toString(),
        },

        android: {
          priority: "high",
          notification: {
            channelId: "high_importance_channel", // 🔥 must match Flutter
          },
        },
      });
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
