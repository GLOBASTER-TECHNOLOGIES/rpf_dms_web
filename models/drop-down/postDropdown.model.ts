import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  postCode: string;
  postType: "POST" | "OUT-POST";
}

const PostSchema: Schema = new Schema(
  {
    postCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    postType: {
      type: String,
      enum: ["POST", "OUT-POST"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.PostData ||
  mongoose.model<IPost>("PostData", PostSchema);
