import mongoose, { Document, Schema } from "mongoose";
import { IStudent } from "./student.model";
import { IExam } from "./exam.model";

export interface IUni extends Document {
  _id: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[] | IStudent[];
  exams: mongoose.Types.ObjectId[] | IExam[];
  account: string;
}

const UniSchema: Schema = new Schema(
  {
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    exams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Exam",
      },
    ],
    account: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUni>("Uni", UniSchema);
