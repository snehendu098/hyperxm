import { Types } from "mongoose";
import { IStudent } from "@/models/student.model";
import { IExam } from "@/models/exam.model";

export interface UniversityAuthResponse {
  success: boolean;
  data?: {
    id: Types.ObjectId;
    exams: IExam[];
    totalExams: number;
    totalStudents: number;
    students: IStudent[];
  };
  message?: string;
}

export interface UniversityAuthRequest {
  account: string;
}
