import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import UniModel from "@/models/uni.model";
import StudentModel from "@/models/student.model";
import ExamModel from "@/models/exam.model";
import StatsModel from "@/models/stats.model";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse request body
    const { account, uniId } = await req.json();

    // Validate account address
    if (!account || typeof account !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid account address" },
        { status: 400 }
      );
    }

    // Check if account is associated with any university
    const existingUni = await UniModel.findOne({ account });
    if (existingUni) {
      return NextResponse.json(
        {
          success: false,
          error: "Account address is already associated with a university",
        },
        { status: 409 }
      );
    }

    // Find existing student
    let student = await StudentModel.findOne({ account });
    let university;

    if (student) {
      // Existing student - get their university
      university = await UniModel.findById(student.uniId);
      if (!university) {
        return NextResponse.json(
          { success: false, error: "Student's university not found" },
          { status: 404 }
        );
      }
    } else {
      // New student - validate uniId
      if (!uniId || !mongoose.Types.ObjectId.isValid(uniId)) {
        return NextResponse.json(
          {
            success: false,
            error: "University ID is required for new students",
          },
          { status: 400 }
        );
      }

      // Verify the university exists
      university = await UniModel.findById(uniId);
      if (!university) {
        return NextResponse.json(
          { success: false, error: "University not found" },
          { status: 404 }
        );
      }

      // Create new student
      student = await StudentModel.create({
        account,
        examStats: [],
        uniId: university._id,
      });

      // Add student to university's students array
      await UniModel.findByIdAndUpdate(university._id, {
        $push: { students: student.account },
      });
    }

    // Get last 20 exams created by the university
    const uniExams = await ExamModel.find({ uni: university.account })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Get exams from other universities that are not private
    const otherExams = await ExamModel.find({
      uni: { $ne: university.account },
      private: false,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get total exams created by the university
    const totalExams = await ExamModel.countDocuments({
      uni: university.account,
    });

    // Get exams attended by the student
    const attendedExamsAggregation = await StatsModel.aggregate([
      {
        $match: {
          student: student.account,
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
          _id: "$exam",
        },
      },
      {
        $count: "attendedExams",
      },
    ]);

    const attendedExams =
      attendedExamsAggregation.length > 0
        ? attendedExamsAggregation[0].attendedExams
        : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          uniExams: uniExams,
          otherExams: otherExams,
          exams: totalExams,
          attendedExams: attendedExams,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Student authentication error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
