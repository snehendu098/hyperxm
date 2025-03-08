import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import UniModel from "@/models/uni.model";
import StudentModel from "@/models/student.model";
import ExamModel from "@/models/exam.model";
import StatsModel from "@/models/stats.model";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    // Connect to database
    await dbConnect();

    const { examId } = params;

    // Get student account from request body
    const { account: studentAccount } = await req.json();

    // Validate exam ID
    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json(
        { success: false, error: "Invalid exam ID" },
        { status: 400 }
      );
    }

    if (!studentAccount) {
      return NextResponse.json(
        { success: false, error: "Student account is required" },
        { status: 401 }
      );
    }

    // Check if the account belongs to a student
    const student = await StudentModel.findOne({ account: studentAccount });
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if the student has already taken this exam
    const existingStats = await StatsModel.findOne({
      student: studentAccount,
      exam: new mongoose.Types.ObjectId(examId),
    });

    if (existingStats) {
      return NextResponse.json(
        { success: false, error: "You have already taken this exam" },
        { status: 403 }
      );
    }

    // Get the exam
    const exam = await ExamModel.findById(examId);
    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    // Check if the exam is active
    if (!exam.isActive) {
      return NextResponse.json(
        { success: false, error: "This exam is no longer active" },
        { status: 403 }
      );
    }

    // Handle access control based on exam privacy
    if (exam.private) {
      // For private exams, check if student belongs to the exam's university
      const examUni = await UniModel.findOne({ account: exam.uni });

      if (!examUni) {
        return NextResponse.json(
          { success: false, error: "Exam university not found" },
          { status: 404 }
        );
      }

      // Check if the student's university matches the exam's university
      if (!student.uniId.equals(examUni._id)) {
        return NextResponse.json(
          {
            success: false,
            error: "You do not have access to this private exam",
          },
          { status: 403 }
        );
      }
    }

    // Prepare the response - send questions but remove correct answers
    const questionsWithoutAnswers = exam.questions.map((q) => {
      // Use spread operator to create a plain object without the correctAnswer
      const questionObj = q as any;
      const { correctAnswer, ...questionWithoutAnswer } = questionObj;
      return questionWithoutAnswer;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: exam._id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          questions: questionsWithoutAnswers,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch exam error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
