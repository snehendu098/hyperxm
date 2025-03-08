import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import UniModel from "@/models/uni.model";
import StudentModel from "@/models/student.model";
import ExamModel from "@/models/exam.model";
import StatsModel from "@/models/stats.model";

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse request body
    const { account } = await req.json();

    // Validate account address
    if (!account || typeof account !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid account address" },
        { status: 400 }
      );
    }

    // Check if account is associated with any student
    const existingStudent = await StudentModel.findOne({ account });
    if (existingStudent) {
      return NextResponse.json(
        {
          success: false,
          error: "Account address is already associated with a student",
        },
        { status: 409 }
      );
    }

    // Find or create university with this account
    let university = await UniModel.findOne({ account });

    if (!university) {
      // Create new university
      university = await UniModel.create({
        account,
        students: [],
        exams: [],
      });
    }

    // Get current month details for filtering
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Get exams created by this university
    const exams = await ExamModel.find({ uni: university.account }).sort({
      createdAt: -1,
    });

    // Get total exams created in the current month
    const totalExams = await ExamModel.countDocuments({
      uni: university.account,
      createdAt: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      },
    });

    // Get total students who attended exams in the current month
    const studentsStatsAggregation = await StatsModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth,
          },
        },
      },
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "examInfo",
        },
      },
      {
        $unwind: "$examInfo",
      },
      {
        $match: {
          "examInfo.uni": university.account,
        },
      },
      {
        $group: {
          _id: "$student",
        },
      },
      {
        $count: "totalStudents",
      },
    ]);

    const totalStudents =
      studentsStatsAggregation.length > 0
        ? studentsStatsAggregation[0].totalStudents
        : 0;

    // Get last 20 students
    const lastStudentsAggregation = await StudentModel.aggregate([
      {
        $match: {
          uniId: university._id,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 20,
      },
      {
        $lookup: {
          from: "stats",
          let: { studentAccount: "$account" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$student", "$$studentAccount"] },
              },
            },
            {
              $lookup: {
                from: "exams",
                localField: "exam",
                foreignField: "_id",
                as: "examInfo",
              },
            },
            {
              $unwind: "$examInfo",
            },
            {
              $match: {
                $expr: { $eq: ["$examInfo.uni", university.account] },
              },
            },
          ],
          as: "examStats",
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: university._id,
          exams: exams,
          totalExams: totalExams,
          totalStudents: totalStudents,
          students: lastStudentsAggregation,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("University authentication error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
