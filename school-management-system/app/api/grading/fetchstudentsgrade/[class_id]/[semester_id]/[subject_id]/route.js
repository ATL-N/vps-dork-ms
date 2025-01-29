import db from "../../../../../../lib/db";
import { NextResponse } from "next/server";

// /api/grading/fetchstudentsgrade/[class_id]/[semester_id]/[subject_id]
export async function GET(req, {params}) {
  try {
      const { class_id, semester_id, subject_id } = params;

    // const { searchParams } = new URL(req.url);
    // const class_id = searchParams.get("class_id");
    // const semester_id = searchParams.get("semester_id");
    // const subject_id = searchParams.get("subject_id");

    if (!class_id || !semester_id || !subject_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        sg.student_id,
        sg.class_score,
        sg.exams_score,
        sg.total_score,
        sg.user_id
      FROM 
        student_grades sg
      WHERE 
        sg.class_id = $1 AND
        sg.semester_id = $2 AND
        sg.subject_id = $3
    `;

    const result = await db.query(query, [class_id, semester_id, subject_id]);

    const grades = result.rows.map((row) => ({
      student_id: row.student_id,
      class_score: row.class_score,
      exams_score: row.exams_score,
      total_score: row.total_score,
    }));

    return NextResponse.json(
      {
        class_id,
        subject_id,
        semester_id,
        user_id: result.rows[0]?.user_id,
        grades,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
