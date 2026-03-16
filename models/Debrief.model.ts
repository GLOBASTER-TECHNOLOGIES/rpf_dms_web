import mongoose, { Schema, Document } from "mongoose";

export interface IDebrief extends Document {
  staffId: mongoose.Types.ObjectId;
  shift: string;
  date: Date;
  postCode?: string;
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

    postCode: {
      type: String,
    },

    date: {
      type: Date,
      default: Date.now,
      required: true,
    },

    transcript: String,

    summary: String,

    observations: String,

    improvements: String,

    approved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Debrief ||
  mongoose.model<IDebrief>("Debrief", DebriefSchema);
