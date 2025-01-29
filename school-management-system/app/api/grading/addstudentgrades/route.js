import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/grading/addstudentgrades
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("this is the body", body);
    const { class_id, subject_id, semester_id, user_id, grades } = body;

    if (
      !class_id ||
      !subject_id ||
      !semester_id ||
      !user_id ||
      !grades ||
      !grades.length
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      await db.query("BEGIN");

      for (const grade of grades) {
        const { student_id, class_score, exams_score, total_score } = grade;
        const insertQuery = `
          WITH grade_info AS (
            SELECT gradescheme_id
            FROM grading_scheme
            WHERE $1 BETWEEN minimum_mark AND maximum_mark
          )
          INSERT INTO student_grades 
          (student_id, subject_id, class_id, user_id, semester_id, class_score, exams_score, total_score, gradescheme_id)
          VALUES ($2, $3, $4, $5, $6, $7, $8, $9, (SELECT gradescheme_id FROM grade_info))
          ON CONFLICT (student_id, subject_id, class_id, semester_id)
          DO UPDATE SET
            class_score = EXCLUDED.class_score,
            exams_score = EXCLUDED.exams_score,
            total_score = EXCLUDED.total_score,
            user_id = EXCLUDED.user_id,
            gradescheme_id = EXCLUDED.gradescheme_id;
        `;
        await db.query(insertQuery, [
          total_score,
          student_id,
          subject_id,
          class_id,
          user_id,
          semester_id,
          class_score,
          exams_score,
          total_score,
        ]);
      }

      await db.query("COMMIT");
      return NextResponse.json(
        { message: "Grades submitted successfully" },
        { status: 201 }
      );
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error in grade submission:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
