import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  stationId: mongoose.Types.ObjectId;
  name: string;
  locationDescription?: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

const PostSchema: Schema<IPost> = new Schema(
  {
    stationId: {
      type: Schema.Types.ObjectId,
      ref: "Station"
    },

    name: String,

    locationDescription: String,

    riskLevel: {
      type: String,
      enum: ["LOW","MEDIUM","HIGH","CRITICAL"]
    }
  },
  { timestamps: true }
);

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;