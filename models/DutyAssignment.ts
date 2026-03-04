import mongoose, { Schema, Document } from "mongoose";

export interface IDutyAssignment extends Document {
  staffId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  shift: "MORNING" | "AFTERNOON" | "NIGHT";
  date: Date;
}

const DutyAssignmentSchema = new Schema<IDutyAssignment>(
{
  staffId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post"
  },

  shift: {
    type: String,
    enum: ["MORNING","AFTERNOON","NIGHT"]
  },

  date: Date

},
{ timestamps: true }
);

export default mongoose.models.DutyAssignment ||
mongoose.model<IDutyAssignment>("DutyAssignment", DutyAssignmentSchema);