import mongoose, { Document, Schema } from "mongoose";
import { IStats } from "./stats.model";

export interface IStudent extends Document {
  _id: mongoose.Types.ObjectId;
  account: string;
  examStats: mongoose.Types.ObjectId[] | IStats[];
  uniId: mongoose.Types.ObjectId;
}

const StudentSchema: Schema = new Schema(
  {
    account: {
      type: String,
      required: true,
      unique: true,
    },
    examStats: [
      {
        type: Schema.Types.ObjectId,
        ref: "Stats",
      },
    ],
    uniId: {
      type: Schema.Types.ObjectId,
      ref: "Uni",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStudent>("Student", StudentSchema);
