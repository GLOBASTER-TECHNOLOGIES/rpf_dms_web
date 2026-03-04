import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBriefing extends Document {
  stationId: mongoose.Types.ObjectId;
  shift: "MORNING" | "AFTERNOON" | "NIGHT";
  generatedScript: string;
  language: "ENGLISH" | "TAMIL" | "HINDI";
  generatedBy: mongoose.Types.ObjectId;
  delivered: boolean;
}

const BriefingSchema: Schema<IBriefing> = new Schema(
{
  stationId: {
    type: Schema.Types.ObjectId,
    ref: "Station"
  },

  shift: {
    type: String,
    enum: ["MORNING","AFTERNOON","NIGHT"]
  },

  generatedScript: String,

  language: {
    type: String,
    enum: ["ENGLISH","TAMIL","HINDI"]
  },

  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  delivered: {
    type: Boolean,
    default: false
  }

},
{ timestamps: true }
);

export default mongoose.models.Briefing ||
mongoose.model<IBriefing>("Briefing", BriefingSchema);