import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppConfig extends Document {
  latestVersion: string;
  forceUpdate: boolean;
  downloadUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppConfigSchema: Schema<IAppConfig> = new Schema(
  {
    latestVersion: {
      type: String,
      required: true,
    },
    forceUpdate: {
      type: Boolean,
      default: false,
    },
    downloadUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Ensure single document (optional but recommended)
AppConfigSchema.index({}, { unique: true });

const AppConfig: Model<IAppConfig> =
  mongoose.models.AppConfig ||
  mongoose.model<IAppConfig>("AppConfig", AppConfigSchema);

export default AppConfig;
