import mongoose, { Schema, Document } from 'mongoose';

// 1. Define the TypeScript Interface
export interface ICircular extends Document {
  title: string;
  content: string;
  priority: 'Normal' | 'High' | 'Critical';
  activeFrom: Date;
  activeTo: Date;
  targetPosts: string[]; // e.g., ['Trichy Junction', 'Srirangam']
  issuedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define the Mongoose Schema
const CircularSchema = new Schema<ICircular>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { 
      type: String, 
      enum: ['Normal', 'High', 'Critical'], 
      default: 'Normal' 
    },
    activeFrom: { type: Date, required: true },
    activeTo: { type: Date, required: true },
    targetPosts: [{ type: String }], 
    issuedBy: { type: String }
  },
  { timestamps: true }
);

// 3. Export the model (with Next.js hot-reload safety)
export default mongoose.models.Circular || mongoose.model<ICircular>('Circular', CircularSchema);