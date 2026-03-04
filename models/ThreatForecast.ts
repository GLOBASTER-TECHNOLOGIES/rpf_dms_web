import mongoose, { Schema, Document } from "mongoose";

export interface IThreatForecast extends Document {
  stationId: mongoose.Types.ObjectId;
  date: Date;
  predictedCrowdLevel: string;
  predictedRisk: string;
  notes?: string;
}

const ThreatForecastSchema = new Schema<IThreatForecast>(
{
  stationId: {
    type: Schema.Types.ObjectId,
    ref: "Station"
  },

  date: Date,

  predictedCrowdLevel: String,

  predictedRisk: String,

  notes: String

},
{ timestamps: true }
);

export default mongoose.models.ThreatForecast ||
mongoose.model<IThreatForecast>("ThreatForecast", ThreatForecastSchema);