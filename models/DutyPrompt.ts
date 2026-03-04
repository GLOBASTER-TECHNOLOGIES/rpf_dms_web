import mongoose, { Schema, Document } from "mongoose";

export interface IDutyPrompt extends Document {
  trainId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  instructions: string[];
  crowdLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  generatedAt: Date;
}

const DutyPromptSchema = new Schema<IDutyPrompt>(
{
  trainId: {
    type: Schema.Types.ObjectId,
    ref: "TrainSchedule"
  },

  staffId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  instructions: [String],

  crowdLevel: {
    type: String,
    enum: ["LOW","MEDIUM","HIGH","VERY_HIGH"]
  },

  generatedAt: Date

},
{ timestamps: true }
);

export default mongoose.models.DutyPrompt ||
mongoose.model<IDutyPrompt>("DutyPrompt", DutyPromptSchema);