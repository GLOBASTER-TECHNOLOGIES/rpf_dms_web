import mongoose, { Schema, Document } from "mongoose";

export interface ISection extends Document {
  post: string;
  sectionCode: string;
  type: string; // "MAIN", "BRANCH"
}

const SectionSchema: Schema = new Schema(
  {
    sectionCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    post: {
      type: String,
      required: true,
      index: true,
      uppercase: true,
    },
    type: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
export default mongoose.models.Section ||
  mongoose.model<ISection>("Section", SectionSchema);
