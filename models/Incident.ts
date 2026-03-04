import mongoose, { Schema, Document } from "mongoose";

export interface IIncident extends Document {
  stationId: mongoose.Types.ObjectId;
  type: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reportedBy: mongoose.Types.ObjectId;
  location?: string;
  images?: string[];
}

const IncidentSchema = new Schema<IIncident>(
{
  stationId: {
    type: Schema.Types.ObjectId,
    ref: "Station"
  },

  type: String,

  description: String,

  severity: {
    type: String,
    enum: ["LOW","MEDIUM","HIGH","CRITICAL"]
  },

  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  location: String,

  images: [String]

},
{ timestamps: true }
);

export default mongoose.models.Incident ||
mongoose.model<IIncident>("Incident", IncidentSchema);