import mongoose, { Document, Schema } from "mongoose";
import { IUni } from "./uni.model";

interface IQuestion extends Document {
  questionText: string;
  options: { id: number; text: string }[];
  correctAnswer: number;
  points: number;
}

export interface IExam extends Document {
  _id: mongoose.Types.ObjectId;
  uni: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  questions: IQuestion[];
  isActive: boolean;
  private: boolean;
  skills: string[];
  expectedPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema({
  id: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

const QuestionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [OptionSchema],
  correctAnswer: {
    type: Number,
    required: true,
  },
  points: {
    type: Number,
    default: 1,
  },
});

const ExamSchema: Schema = new Schema(
  {
    uni: {
      type: String,
      required: true,
      ref: "Uni",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      required: true,
    },
    questions: [QuestionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    private: {
      type: Boolean,
      default: false,
    },
    skills: {
      type: [String],
      default: [],
    },
    expectedPoints: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IExam>("Exam", ExamSchema);
