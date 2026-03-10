import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOfficer extends Document {
  name: string;
  forceNumber: string;
  rank: "DSC" | "ASC" | "IPF" | "SI" | "ASI" | "HC" | "CONSTABLE";
  role: "ADMIN" | "SO" | "STAFF";
  postCode: string;
  division: string;
  password: string;
  active: boolean;
  mustChangePassword: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OfficerSchema: Schema<IOfficer> = new Schema(
  {
    name: { type: String, required: true, trim: true },

    forceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    rank: {
      type: String,
      enum: ["DSC", "ASC", "IPF", "SI", "ASI", "HC", "CONSTABLE"],
      required: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "SO", "STAFF"],
      required: true,
    },

    postCode: {
      type: String,
      ref: "Post",
      required: true,
      uppercase: true,
      trim: true,
    },

    division: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    active: {
      type: Boolean,
      default: true,
    },

    mustChangePassword: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

const Officer: Model<IOfficer> =
  mongoose.models.Officer ||
  mongoose.model<IOfficer>("Officer", OfficerSchema);

export default Officer;