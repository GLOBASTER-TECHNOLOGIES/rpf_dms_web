import mongoose, { Schema, Document } from "mongoose";

export interface IDebrief extends Document {
  staffId: mongoose.Types.ObjectId;
  shift: string;
  voiceFile?: string;
  transcript?: string;
  summary?: string;
  observations?: string;
  improvements?: string;
  dutyRating?: string;
  approved: boolean;
}

const DebriefSchema = new Schema<IDebrief>(
{
  staffId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  shift: String,

  voiceFile: String,

  transcript: String,

  summary: String,

  observations: String,

  improvements: String,

  dutyRating: String,

  approved: {
    type: Boolean,
    default: false
  }

},
{ timestamps: true }
);

export default mongoose.models.Debrief ||
mongoose.model<IDebrief>("Debrief", DebriefSchema);