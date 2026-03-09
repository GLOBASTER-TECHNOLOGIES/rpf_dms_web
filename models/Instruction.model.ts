import mongoose, { Schema, Document } from "mongoose";

export interface IInstruction extends Document {
  title: string;
  instruction: string;
  shift: "morning" | "evening" | "night" | "all";
  validFrom: Date;
  validTo: Date;
  createdBy: mongoose.Types.ObjectId;
  active: boolean;
}

const InstructionSchema = new Schema<IInstruction>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    instruction: {
      type: String,
      required: true,
    },

    shift: {
      type: String,
      enum: ["morning", "evening", "night", "all"],
      default: "all",
    },

    validFrom: {
      type: Date,
      required: true,
    },

    validTo: {
      type: Date,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Instruction ||
  mongoose.model<IInstruction>("Instruction", InstructionSchema);