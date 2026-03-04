import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStation extends Document {
  name: string;
  code: string;
  division: string;
  zone: string;
  state: string;
  platformCount: number;
}

const StationSchema: Schema<IStation> = new Schema(
  {
    name: String,

    code: String,

    division: String,

    zone: String,

    state: String,

    platformCount: Number,
  },
  { timestamps: true },
);

const Station: Model<IStation> =
  mongoose.models.Station || mongoose.model<IStation>("Station", StationSchema);

export default Station;
