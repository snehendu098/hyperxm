import mongoose, { Document, Schema } from "mongoose";
import { IExam } from "./exam.model";
import { IStudent } from "./student.model";

export interface IStats extends Document {
  _id: mongoose.Types.ObjectId;
  exam: mongoose.Types.ObjectId | IExam;
  stats: Record<string, any>;
  student: string;
  xp: number;
}

const StatsSchema: Schema = new Schema(
  {
    exam: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    stats: {
      type: Schema.Types.Mixed,
      required: true,
    },
    student: {
      type: String,
      required: true,
      ref: "Student",
    },
    xp: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a student can only have one stats entry per exam
StatsSchema.index({ exam: 1, student: 1 }, { unique: true });

export default mongoose.model<IStats>("Stats", StatsSchema);
