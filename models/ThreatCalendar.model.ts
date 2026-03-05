import mongoose, { Schema, Document, Model } from "mongoose";

export interface IThreatCalendar extends Document {
  eventName: string;
  type: "FESTIVAL" | "EXAM" | "POLITICAL" | "LOCAL_EVENT";
  location?: string; // Kept as an optional generic string
  startDate: Date;
  endDate: Date;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  advisories?: string; // Highly recommended so the AI knows what instructions to give
}

const ThreatCalendarSchema: Schema<IThreatCalendar> = new Schema(
  {
    eventName: { 
      type: String, 
      required: true 
    },
    type: {
      type: String,
      enum: ["FESTIVAL", "EXAM", "POLITICAL", "LOCAL_EVENT"],
      required: true
    },
    location: { 
      type: String // Optional: e.g., "Division Wide" or "Trichy City"
    },
    startDate: { 
      type: Date, 
      required: true 
    },
    endDate: { 
      type: Date, 
      required: true 
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true
    },
    advisories: { 
      type: String // e.g., "Deploy extra QRT at main gates"
    }
  },
  { timestamps: true }
);

const ThreatCalendar: Model<IThreatCalendar> =
  mongoose.models.ThreatCalendar ||
  mongoose.model<IThreatCalendar>("ThreatCalendar", ThreatCalendarSchema);

export default ThreatCalendar;