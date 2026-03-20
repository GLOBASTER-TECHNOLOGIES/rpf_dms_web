import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IShift extends Document {
  shiftName: string;
  shiftDate: Date;

  post: string; // Post code

  briefingDocument: Types.ObjectId; // Single briefing document

  instructions: Types.ObjectId[]; // Instructions for this shift

  officers: Types.ObjectId[]; // Array of Officer IDs

  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema: Schema<IShift> = new Schema(
  {
    shiftName: {
      type: String,
      required: true,
      trim: true,
    },

    shiftDate: {
      type: Date,
      required: true,
    },

    post: {
      type: String,
      ref: "Post",
      required: true,
      uppercase: true,
      trim: true,
    },

    briefingDocument: {
      type: Schema.Types.ObjectId,
      ref: "Briefing",
      required: true,
    },

    instructions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Instruction",
      },
    ],

    officers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Officer",
        required: true,
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Officer",
      required: true,
    },
  },
  { timestamps: true },
);

const Shift: Model<IShift> =
  mongoose.models.Shift || mongoose.model<IShift>("Shift", ShiftSchema);

export default Shift;
