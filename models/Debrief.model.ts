import mongoose, { Schema, Document } from "mongoose";

// ── Single train report inside a shift debrief ──
export interface ITrainReport {
  trainNo?: string;
  transcript: string;
  summary?: string;
  observations?: string;
  improvements?: string;
  submittedAt: Date;
}

export interface IDebrief extends Document {
  staffId: mongoose.Types.ObjectId;
  shift: "Morning" | "Afternoon" | "Night";
  date: Date;
  postCode?: string;
  reports: ITrainReport[];
}

const TrainReportSchema = new Schema<ITrainReport>(
  {
    trainNo: {
      type: String,
      default: null,
    },
    transcript: {
      type: String,
      required: true,
    },
    summary: String,
    observations: String,
    improvements: String,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }, // each report gets its own _id
);

const DebriefSchema = new Schema<IDebrief>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Officer",
      required: true,
    },
    shift: {
      type: String,
      enum: ["Morning", "Afternoon", "Night"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    postCode: {
      type: String,
    },
    reports: {
      type: [TrainReportSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.models.Debrief ||
  mongoose.model<IDebrief>("Debrief", DebriefSchema);
