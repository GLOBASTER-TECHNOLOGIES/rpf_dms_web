import mongoose, { Schema, Document } from "mongoose";

export interface IDebrief extends Document {
  staffId: mongoose.Types.ObjectId;
  shift: string;
  date: Date;
  transcript?: string;
  summary?: string;
  observations?: string;
  improvements?: string;
  approved: boolean;
}

const DebriefSchema = new Schema<IDebrief>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Officer",
    },

    shift: String,

    date: {
      type: Date,
      default: Date.now,
      required: true,
    },

    transcript: String,

    summary: String,

    observations: String,

    improvements: String,
  },
  { timestamps: true },
);

export default mongoose.models.Debrief ||
  mongoose.model<IDebrief>("Debrief", DebriefSchema);
