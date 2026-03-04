import mongoose, { Schema, Document } from "mongoose";

export interface IPerformanceScore extends Document {
  staffId: mongoose.Types.ObjectId;
  dutyDate: Date;
  incidentsHandled: number;
  responseScore: number;
  briefingAttendance: boolean;
  rating: number;
}

const PerformanceScoreSchema = new Schema<IPerformanceScore>(
{
  staffId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  dutyDate: Date,

  incidentsHandled: Number,

  responseScore: Number,

  briefingAttendance: Boolean,

  rating: Number

},
{ timestamps: true }
);

export default mongoose.models.PerformanceScore ||
mongoose.model<IPerformanceScore>("PerformanceScore", PerformanceScoreSchema);