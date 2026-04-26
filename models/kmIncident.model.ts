import mongoose, { Schema, Document, models, model } from "mongoose";

export enum IncidentType {
  TRESPASSING = "TRESPASSING",
  CATTLE = "CATTLE",
  OBSTRUCTION = "OBSTRUCTION",
  TRACK_DAMAGE = "TRACK_DAMAGE",
  FIRE = "FIRE",
  FLOOD = "FLOOD",
  SIGNAL_FAILURE = "SIGNAL_FAILURE",
  ACCIDENT = "ACCIDENT",
}

// ---------------- INTERFACE ----------------

export interface IKmIncident extends Document {
  division: string;
  rpf_post: string;
  section: string;
  track_km: number;
  incident_type: IncidentType;
  date_of_occurrence: Date;
}

// ---------------- SCHEMA ----------------

const kmIncidentSchema = new Schema<IKmIncident>(
  {
    division: {
      type: String,
      required: true,
      trim: true,
    },

    rpf_post: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    section: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    track_km: {
      type: Number,
      required: true,
      index: true,
    },

    incident_type: {
      type: String,
      enum: Object.values(IncidentType),
      required: true,
      index: true,
    },

    date_of_occurrence: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for analytics
kmIncidentSchema.index({
  section: 1,
  track_km: 1,
  incident_type: 1,
});

// ---------------- MODEL EXPORT ----------------

const KmIncident =
  models.KmIncident || model<IKmIncident>("KmIncident", kmIncidentSchema);

export default KmIncident;
