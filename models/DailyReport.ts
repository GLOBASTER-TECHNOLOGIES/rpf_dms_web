import mongoose, { Schema, Document } from "mongoose";

export interface IDailyReport extends Document {
  stationId: mongoose.Types.ObjectId;
  date: Date;
  incidents: number;
  staffOnDuty: number;
  summary: string;
}

const DailyReportSchema = new Schema<IDailyReport>(
{
  stationId: {
    type: Schema.Types.ObjectId,
    ref: "Station"
  },

  date: Date,

  incidents: Number,

  staffOnDuty: Number,

  summary: String

},
{ timestamps: true }
);

export default mongoose.models.DailyReport ||
mongoose.model<IDailyReport>("DailyReport", DailyReportSchema);