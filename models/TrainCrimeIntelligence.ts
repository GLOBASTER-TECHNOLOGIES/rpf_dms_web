import mongoose, { Document, Model, Schema } from "mongoose";

// ─── INTERFACES ─────────────────────────────────────────────────────────────

// Interface for Crime Profile (e.g., "Child Rescue: 9", "Contraband: 5")
export interface ICrimeProfile {
  crimeType: string;
  count: number;
}

// Interface for the Excel Data (RA Sections)
export interface IRaCases {
  sec141: number; // Trespass
  sec144: number; // Unlawful possession of railway property
  sec145b: number; // Drunkenness / Nuisance
  sec155: number; // Entering reserved compartment
  sec156: number; // Roof riding
  sec162: number; // Entering ladies carriage
  sec163: number; // False declaration of goods
  sec164: number; // Bringing dangerous goods
}

// Main Interface representing a document in MongoDB
export interface ITrainCrimeIntelligence extends Document {
  trainNumber: string;

  // Data populated from the PDF Report
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "N/A";
  totalIncidents: number;
  crimeProfile: ICrimeProfile[];
  primaryDutyAction: string;

  // Data populated from the Excel/CSV file
  raCases: IRaCases;

  // Timestamps provided by Mongoose
  createdAt: Date;
  updatedAt: Date;
}

// ─── SCHEMAS ────────────────────────────────────────────────────────────────

// Sub-schema for Crime Profile
const crimeProfileSchema = new Schema<ICrimeProfile>(
  {
    crimeType: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

// Sub-schema for RA Cases
const raCasesSchema = new Schema<IRaCases>(
  {
    sec141: { type: Number, default: 0 },
    sec144: { type: Number, default: 0 },
    sec145b: { type: Number, default: 0 },
    sec155: { type: Number, default: 0 },
    sec156: { type: Number, default: 0 },
    sec162: { type: Number, default: 0 },
    sec163: { type: Number, default: 0 },
    sec164: { type: Number, default: 0 },
  },
  { _id: false },
);

// Main Schema
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

    raCases: {
      type: raCasesSchema,
      default: () => ({}), // Initializes with all 0s using the defaults above
    },
  },
  {
    timestamps: true,
  },
);

// ─── MODEL EXPORT ───────────────────────────────────────────────────────────

// Prevent mongoose from compiling the model multiple times in development
const TrainCrimeIntelligence: Model<ITrainCrimeIntelligence> =
  mongoose.models.TrainCrimeIntelligence ||
  mongoose.model<ITrainCrimeIntelligence>(
    "TrainCrimeIntelligence",
    trainCrimeIntelligenceSchema,
  );

export default TrainCrimeIntelligence;
