import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import StudentModel, { IStudent } from "@/models/student.model";
import ExamModel from "@/models/exam.model";
import StatsModel, { IStats } from "@/models/stats.model";
import mongoose from "mongoose";

// Define interfaces for type safety
interface QuestionResult {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
}

interface QnAItem {
  question: string;
  options: Array<{ id: number; text: string }>;
  correct: boolean;
  option: number | null;
  actualOption: number;
}

interface ResultsResponse {
  success: boolean;
  data: {
    qna: QnAItem[];
    points: number;
    xp: number;
    avgPoints: number;
  };
}

interface ResultsErrorResponse {
  success: false;
  error: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { examId: string } }
): Promise<NextResponse<ResultsResponse | ResultsErrorResponse>> {
  try {
    // Connect to database
    await dbConnect();

    const { examId } = params;

    // Get student account from request body
    const { account: studentAccount } = (await req.json()) as {
      account: string;
    };

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

    // Get the exam
    const exam = await ExamModel.findById(examId);
    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    // Get the student's stats for this exam
    const studentStats = await StatsModel.findOne({
      exam: new mongoose.Types.ObjectId(examId),
      student: studentAccount,
    });

    if (!studentStats) {
      return NextResponse.json(
        { success: false, error: "You have not taken this exam yet" },
        { status: 404 }
      );
    }

    // Ensure stats.questionResults exists and is an array
    const questionResults = (studentStats.stats.questionResults ||
      []) as QuestionResult[];

    // Create a map of question ID to result for quicker lookups
    const resultsMap: Record<string, QuestionResult> = {};
    questionResults.forEach((result) => {
      resultsMap[result.questionId] = result;
    });

    // Build detailed QnA data
    const qna: QnAItem[] = exam.questions.map((question) => {
      const questionId = question._id?.toString() || "";
      const result = resultsMap[questionId] || ({} as QuestionResult);

      return {
        question: question.questionText,
        options: question.options,
        correct: result.isCorrect || false,
        option: result.userAnswer || null,
        actualOption: question.correctAnswer,
      };
    });

    // Get average XP of other students who took this exam
    const averageXpAggregate = await StatsModel.aggregate<{
      _id: null;
      avgXp: number;
      count: number;
    }>([
      {
        $match: {
          exam: new mongoose.Types.ObjectId(examId),
          student: { $ne: studentAccount }, // Exclude the current student
        },
      },
      {
        $group: {
          _id: null,
          avgXp: { $avg: "$xp" },
          count: { $sum: 1 },
        },
      },
    ]);

    const averageXp =
      averageXpAggregate.length > 0
        ? Math.round(averageXpAggregate[0].avgXp)
        : 0;

    const earnedPoints =
      typeof studentStats.stats.earnedPoints === "number"
        ? studentStats.stats.earnedPoints
        : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          qna,
          points: earnedPoints,
          xp: studentStats.xp,
          avgPoints: averageXp,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Exam results error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
