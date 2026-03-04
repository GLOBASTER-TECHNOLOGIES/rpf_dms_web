import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  badgeNumber?: string;
  rank?: "DSC" | "ASC" | "IPF" | "SI" | "ASI" | "HC" | "CONSTABLE";
  role: "ADMIN" | "SO" | "STAFF";
  stationId?: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  password: string;
  active: boolean;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },

    badgeNumber: { type: String, unique: true },

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

    password: { type: String, required: true },

    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
