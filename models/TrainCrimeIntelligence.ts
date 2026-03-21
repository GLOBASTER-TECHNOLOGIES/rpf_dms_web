import mongoose, { Document, Model, Schema } from "mongoose";

// ─── INTERFACES ─────────────────────────────────────────────────────────────

export interface ICrimeProfile {
  crimeType: string;
  count: number;
}

// One RM complaint record linked to this train
export interface IRmComplaint {
  subHead: string; // Sub Head (e)
  placeOfOccurrence: string; // Place of Occurrence (g)
  dateOfComplaint?: string;
}

// Main Interface
export interface ITrainCrimeIntelligence extends Document {
  trainNumber: string;

  // From PDF report
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "N/A";
  totalIncidents: number;
  crimeProfile: ICrimeProfile[];
  primaryDutyAction: string;

  // From RM Complaint Excel
  rmComplaintCount: number;
  rmComplaints: IRmComplaint[];

  createdAt: Date;
  updatedAt: Date;
}

// ─── SCHEMAS ────────────────────────────────────────────────────────────────

const crimeProfileSchema = new Schema<ICrimeProfile>(
  {
    crimeType: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const rmComplaintSchema = new Schema<IRmComplaint>(
  {
    subHead: { type: String, default: "" }, // Sub Head (e)
    placeOfOccurrence: { type: String, default: "" }, // Place of Occurrence (g)
    dateOfComplaint: { type: String, default: "" },
  },
  { _id: false },
);

const trainCrimeIntelligenceSchema = new Schema<ITrainCrimeIntelligence>(
  {
    trainNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    riskLevel: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "N/A"],
      default: "N/A",
    },

    totalIncidents: {
      type: Number,
      default: 0,
    },

    crimeProfile: {
      type: [crimeProfileSchema],
      default: [],
    },

    primaryDutyAction: {
      type: String,
      default: "",
    },

    // ── RM Complaint data from Excel ──────────────────────────────────────
    rmComplaintCount: {
      type: Number,
      default: 0,
    },

    rmComplaints: {
      type: [rmComplaintSchema],
      default: [],
    },
  },
  { timestamps: true },
);

// ─── MODEL EXPORT ────────────────────────────────────────────────────────────

const TrainCrimeIntelligence: Model<ITrainCrimeIntelligence> =
  mongoose.models.TrainCrimeIntelligence ||
  mongoose.model<ITrainCrimeIntelligence>(
    "TrainCrimeIntelligence",
    trainCrimeIntelligenceSchema,
  );

export default TrainCrimeIntelligence;
