
import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/remarks/addclassremarks

export async function POST(req) {
  try {
    const body = await req.json();
    const { students, class_id, semester_id, user_id } = body;

    // Begin a transaction
    await db.query("BEGIN");

    for (const student of students) {
      const { id, teacherRemark, headteacherRemark } = student;

      // Check if a remark already exists for this student, class, and semester
      const checkQuery = `
        SELECT remark_id FROM student_remarks
        WHERE student_id = $1 AND class_id = $2 AND semester_id = $3
      `;
      const checkResult = await db.query(checkQuery, [
        id,
        class_id,
        semester_id,
      ]);

      if (checkResult.rows.length > 0) {
        // Update existing remark
        const updateQuery = `
          UPDATE student_remarks
          SET class_teachers_remark = $1, headteachers_remark = $2, user_id = $3
          WHERE student_id = $4 AND class_id = $5 AND semester_id = $6
        `;
        await db.query(updateQuery, [
          teacherRemark,
          headteacherRemark,
          user_id,
          id,
          class_id,
          semester_id,
        ]);
      } else {
        // Insert new remark
        const insertQuery = `
          INSERT INTO student_remarks (student_id, class_id, semester_id, class_teachers_remark, headteachers_remark, user_id)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await db.query(insertQuery, [
          id,
          class_id,
          semester_id,
          teacherRemark,
          headteacherRemark,
          user_id,
        ]);
      }
    }

    // Commit the transaction
    await db.query("COMMIT");

    return NextResponse.json(
      { message: "Remarks saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Rollback the transaction in case of error
    await db.query("ROLLBACK");
    console.error("Error saving student remarks:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
