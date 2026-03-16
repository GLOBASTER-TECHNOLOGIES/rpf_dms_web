import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  postCode: string;
  division: string;
  password: string;
  ipfId?: mongoose.Types.ObjectId;
  contactNumber?: string;
  address?: string;

  refreshToken?: string;
  refreshTokenExpiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema(
  {
    postCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    division: {
      type: String,
      required: true,
      uppercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    ipfId: {
      type: Schema.Types.ObjectId,
      ref: "Officer",
    },

    contactNumber: {
      type: String,
    },

    address: {
      type: String,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    refreshTokenExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
