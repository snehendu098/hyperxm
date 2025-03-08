import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
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

    // Get request body
    const { account, answers } = await req.json();

    // Validate exam ID
    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json(
        { success: false, error: "Invalid exam ID" },
        { status: 400 }
      );
    }

    // Validate student account
    if (!account || typeof account !== "string") {
      return NextResponse.json(
        { success: false, error: "Student account is required" },
        { status: 401 }
      );
    }

    // Validate answers
    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "Answers are required" },
        { status: 400 }
      );
    }

    // Check if the account belongs to a student
    const student = await StudentModel.findOne({ account });
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if the student has already taken this exam
    const existingStats = await StatsModel.findOne({
      student: account,
      exam: new mongoose.Types.ObjectId(examId),
    });

    if (existingStats) {
      return NextResponse.json(
        { success: false, error: "You have already taken this exam" },
        { status: 403 }
      );
    }

    // Get the exam
    const exam = await ExamModel.findById(examId).lean();
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

    // Calculate results
    let totalPoints = 0;
    let earnedPoints = 0;
    const questionResults = [];

    for (const question of exam.questions) {
      // Use string property for checking answers since _id might not be available in the type
      // MongoDB adds _id to subdocuments but TypeScript doesn't know about it
      const questionId = question._id
        ? question._id.toString()
        : String(question.questionText);
      const userAnswer = answers[questionId];
      const isCorrect = userAnswer === question.correctAnswer;

      totalPoints += question.points;
      if (isCorrect) {
        earnedPoints += question.points;
      }

      questionResults.push({
        questionId,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        maxPoints: question.points,
      });
    }

    // Calculate percentage score
    const percentageScore =
      totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const studentPercentage = totalPoints > 0 ? earnedPoints / totalPoints : 0;

    // Step 1: Calculate the Base XP
    const MAX_XP = 1000; // Maximum XP possible for any exam
    const baseXP = Math.round(studentPercentage * MAX_XP);

    // Step 2: Define a Multiplier Using the Expected Average
    // Convert expectedPoints to a percentage of total points
    const expectedPercentage =
      exam.expectedPoints > 0 && totalPoints > 0
        ? exam.expectedPoints / totalPoints
        : 0.6; // Default to 60% if not specified

    const sensitivityFactor = 1.0;
    const lowerBound = 0.8;
    const upperBound = 1.2;

    // Calculate difficulty multiplier with bounds
    let difficultyMultiplier =
      1 + sensitivityFactor * (studentPercentage - expectedPercentage);
    // Clamp the multiplier between lower and upper bounds
    difficultyMultiplier = Math.max(
      lowerBound,
      Math.min(upperBound, difficultyMultiplier)
    );

    // Step 3: Calculate the Final XP
    const finalXP = Math.round(baseXP * difficultyMultiplier);

    // Calculate earned skills
    const earnedSkills = [];
    // If the student scores at least 60% of the expected points, they earn the skills
    if (exam.expectedPoints > 0 && earnedPoints >= exam.expectedPoints * 0.6) {
      earnedSkills.push(...(exam.skills || []));
    }

    // Create exam stats
    const stats = await StatsModel.create({
      exam: new mongoose.Types.ObjectId(examId),
      student: account,
      stats: {
        totalPoints,
        earnedPoints,
        percentageScore,
        questionResults,
        submittedAt: new Date(),
        earnedSkills,
        baseXP,
        difficultyMultiplier,
      },
      xp: finalXP,
    });

    // Update student with the new exam stats
    await StudentModel.findByIdAndUpdate(student._id, {
      $push: { examStats: stats._id },
    });

    return NextResponse.json(
      {
        success: true,
        id: stats._id.toString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Submit exam error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
