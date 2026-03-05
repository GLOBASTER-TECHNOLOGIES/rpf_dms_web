import mongoose, { Schema, Document, Model } from "mongoose";

export interface IThreatCalendar extends Document {
  eventName: string;
  type: "FESTIVAL" | "EXAM" | "POLITICAL" | "LOCAL_EVENT";
  location?: string;
  startDate: Date;
  endDate: Date;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

const ThreatCalendarSchema: Schema<IThreatCalendar> = new Schema(
  {
    eventName: String,

    type: {
      type: String,
      enum: ["FESTIVAL","EXAM","POLITICAL","LOCAL_EVENT"]
    },

    location: String,

    startDate: Date,

    endDate: Date,

    riskLevel: {
      type: String,
      enum: ["LOW","MEDIUM","HIGH","CRITICAL"]
    }
  },
  { timestamps: true }
);

const ThreatCalendar: Model<IThreatCalendar> =
  mongoose.models.ThreatCalendar ||
  mongoose.model<IThreatCalendar>("ThreatCalendar", ThreatCalendarSchema);

export default ThreatCalendar;