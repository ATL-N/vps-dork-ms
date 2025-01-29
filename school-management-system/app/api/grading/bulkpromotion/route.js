import { NextResponse } from "next/server";
import db from "../../../lib/db";

// /api/grading/bulkpromotion
export async function PUT(req) {
  console.log("running one");
  try {
    await db.query("BEGIN");

    console.log("running two");

    // Update all students: set class_id to class_promoted_to and update status if promoted to class 1
    const updateStudentsQuery = `
      UPDATE students
      SET 
        class_id = class_promoted_to,
        status = CASE 
          WHEN class_promoted_to = 1 THEN 'completed'
          ELSE status 
        END
      WHERE class_promoted_to IS NOT NULL
      RETURNING student_id, first_name, last_name, class_id, class_promoted_to, status;
    `;

    const studentsResult = await db.query(updateStudentsQuery);

    console.log("running three");

    // Update the active semester to completed
    const updateSemesterQuery = `
      UPDATE semesters
      SET status = 'completed'
      WHERE status = 'active'
      RETURNING semester_id, semester_name, status;
    `;

    const semesterResult = await db.query(updateSemesterQuery);

    console.log("running four");

    if (studentsResult.rowCount === 0 && semesterResult.rowCount === 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        {
          message:
            "Semester Closed successfully. If this is a promotional term, make sure to promote the students if necessary before closing this term.",
        },
        { status: 200 }
      );
    }

    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: `Term Closed Successfully. Promoted ${studentsResult.rowCount} students.`,
        updatedStudents: studentsResult.rows,
        updatedSemesters: semesterResult.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update students and semester" },
      { status: 500 }
    );
  }
}
