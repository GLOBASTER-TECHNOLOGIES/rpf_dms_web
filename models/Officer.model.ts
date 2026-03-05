import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOfficer extends Document {
  name: string;
  forceNumber?: string;
  rank?: "DSC" | "ASC" | "IPF" | "SI" | "ASI" | "HC" | "CONSTABLE";
  role: "ADMIN" | "SO" | "STAFF";
  stationId?: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  password: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfficerSchema: Schema<IOfficer> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    forceNumber: {
      type: String,
      unique: true,
      index: true,
    },

    rank: {
      type: String,
      enum: ["DSC", "ASC", "IPF", "SI", "ASI", "HC", "CONSTABLE"],
    },

    role: {
      type: String,
      enum: ["ADMIN", "SO", "STAFF"],
      required: true,
    },

    stationId: {
      type: Schema.Types.ObjectId,
      ref: "Station",
    },

    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
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
  },
  {
    timestamps: true,
  },
);

const Officer: Model<IOfficer> =
  mongoose.models.Officer || mongoose.model<IOfficer>("Officer", OfficerSchema);

export default Officer;
