import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITrainSchedule extends Document {
  trainNumber: string;
  trainName: string;
  arrivalTime: string;
  departureTime?: string;
  platform: number;
  daysOfRun: string[];
  source: string;
  destination: string;
}

const TrainScheduleSchema: Schema<ITrainSchedule> = new Schema(
  {
    trainNumber: String,
    trainName: String,
    arrivalTime: String,
    departureTime: String,
    platform: Number,
    daysOfRun: [String],
    source: String,
    destination: String
  },
  { timestamps: true }
);

const TrainSchedule: Model<ITrainSchedule> =
  mongoose.models.TrainSchedule ||
  mongoose.model<ITrainSchedule>("TrainSchedule", TrainScheduleSchema);

export default TrainSchedule;