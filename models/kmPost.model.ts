import mongoose from "mongoose";

const kmPostSchema = new mongoose.Schema(
  {
    division: {
      type: String,
      required: true,
    },

    section: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    jurisdiction_rpfPost: {
      type: String,
      default: "NOT ADDED",
    },

    km_number: {
      type: Number,
      required: true,
    },

    latitude: Number,
    longitude: Number,

    captured_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      required: true,
    },

    captured_at: Date,

    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

kmPostSchema.index({ section: 1, km_number: 1 }, { unique: true });

export default mongoose.models.KmPost || mongoose.model("KmPost", kmPostSchema);
