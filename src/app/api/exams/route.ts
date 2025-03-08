import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import UniModel from "@/models/uni.model";
import ExamModel from "@/models/exam.model";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse request body
    const {
      account,
      title,
      description,
      duration,
      questions,
      private: isPrivate,
      skills,
      expectedPoints,
    } = await req.json();

    // Validate university account
    if (!account || typeof account !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid university account address" },
        { status: 400 }
      );
    }

    // Check if university exists
    const university = await UniModel.findOne({ account });
    if (!university) {
      return NextResponse.json(
        { success: false, error: "University not found" },
        { status: 404 }
      );
    }

    // Validate exam data
    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { success: false, error: "Exam title is required" },
        { status: 400 }
      );
    }

    if (!duration || typeof duration !== "number" || duration <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid exam duration is required (in minutes)",
        },
        { status: 400 }
      );
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Exam must contain at least one question" },
        { status: 400 }
      );
    }

    // Validate skills
    if (skills && !Array.isArray(skills)) {
      return NextResponse.json(
        { success: false, error: "Skills must be an array" },
        { status: 400 }
      );
    }

    // Validate expectedPoints
    if (
      expectedPoints !== undefined &&
      (typeof expectedPoints !== "number" || expectedPoints < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Expected points must be a non-negative number",
        },
        { status: 400 }
      );
    }

    // Validate each question
    for (const question of questions) {
      if (!question.questionText || typeof question.questionText !== "string") {
        return NextResponse.json(
          { success: false, error: "Each question must have question text" },
          { status: 400 }
        );
      }

      if (
        !question.options ||
        !Array.isArray(question.options) ||
        question.options.length < 2
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Each question must have at least two options",
          },
          { status: 400 }
        );
      }

      // Check that each option has id and text
      for (const option of question.options) {
        if (typeof option.id !== "number" || !option.text) {
          return NextResponse.json(
            {
              success: false,
              error: "Each option must have id (number) and text",
            },
            { status: 400 }
          );
        }
      }

      // Validate correct answer
      if (typeof question.correctAnswer !== "number") {
        return NextResponse.json(
          {
            success: false,
            error: "Each question must have a correct answer (option id)",
          },
          { status: 400 }
        );
      }

      // Check if correct answer exists in options
      const correctAnswerExists = question.options.some(
        (option: any) => option.id === question.correctAnswer
      );
      if (!correctAnswerExists) {
        return NextResponse.json(
          { success: false, error: "Correct answer must match an option id" },
          { status: 400 }
        );
      }

      // Validate points
      if (
        !question.points ||
        typeof question.points !== "number" ||
        question.points <= 0
      ) {
        return NextResponse.json(
          { success: false, error: "Each question must have valid points" },
          { status: 400 }
        );
      }
    }

    // Create exam
    const exam = await ExamModel.create({
      uni: university.account,
      title,
      description: description || "",
      duration,
      questions,
      isActive: true,
      private: isPrivate === true,
      skills: skills || [],
      expectedPoints: expectedPoints || 0,
      createdAt: new Date(),
    });

    // Update university with new exam
    await UniModel.findByIdAndUpdate(university._id, {
      $push: { exams: exam._id },
    });

    // Calculate total points possible
    const totalPoints = questions.reduce(
      (sum, question) => sum + question.points,
      0
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: exam._id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          totalQuestions: exam.questions.length,
          totalPoints: totalPoints,
          skills: exam.skills,
          expectedPoints: exam.expectedPoints,
          createdAt: exam.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Exam creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Get query parameters
    const universityAccount = req.nextUrl.searchParams.get("university");
    const isPublic = req.nextUrl.searchParams.get("public") === "true";
    const isActive = req.nextUrl.searchParams.get("active") === "true";
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
    const skip = parseInt(req.nextUrl.searchParams.get("skip") || "0");

    // Build query
    const query: any = {};

    // Filter by university if provided
    if (universityAccount) {
      query.uni = universityAccount;
    }

    // Filter by public/private status if requested
    if (isPublic !== null) {
      query.private = !isPublic;
    }

    // Filter by active status if requested
    if (isActive !== null) {
      query.isActive = isActive;
    }

    // Count total exams matching the query
    const totalExams = await ExamModel.countDocuments(query);

    // Get exams with pagination
    const exams = await ExamModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "_id title description duration isActive private skills expectedPoints createdAt"
      )
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          exams,
          pagination: {
            total: totalExams,
            limit,
            skip,
            hasMore: skip + exams.length < totalExams,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get exams error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
