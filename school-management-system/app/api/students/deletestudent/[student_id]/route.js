import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/students/deletestudent/[student_id]

export async function PUT(req, { params }) {
  const { student_id } = params;

  try {
    await db.query("BEGIN");

    // Step 1: Get user_id for the student
    const getUserIdQuery = `
      SELECT user_id FROM students WHERE student_id = $1;
    `;
    const userResult = await db.query(getUserIdQuery, [student_id]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const user_id = userResult.rows[0].user_id;

    // Step 2: Update status in students table
    const updateStudentQuery = `
      UPDATE students SET status = 'inactive' WHERE student_id = $1;
    `;
    await db.query(updateStudentQuery, [student_id]);

    // Step 3: Update status in users table
    const updateUserQuery = `
      UPDATE users SET status = 'inactive' WHERE user_id = $1;
    `;
    await db.query(updateUserQuery, [user_id]);

    // Step 4: Update status in user_health_record table
    const updateHealthRecordQuery = `
      UPDATE user_health_record SET status = 'inactive' WHERE user_id = $1;
    `;
    await db.query(updateHealthRecordQuery, [user_id]);

    // Step 5: Get parent IDs for the student
    const getParentIdsQuery = `
      SELECT parent_id FROM student_parent WHERE student_id = $1;
    `;
    const parentResult = await db.query(getParentIdsQuery, [student_id]);
    const parentIds = parentResult.rows.map((row) => row.parent_id);

    // Step 6: Check if parents have other active students and update status if not
    for (const parent_id of parentIds) {
      const checkOtherStudentsQuery = `
        SELECT COUNT(*) FROM student_parent sp
        JOIN students s ON sp.student_id = s.student_id
        WHERE sp.parent_id = $1 AND s.status = 'active' AND s.student_id != $2;
      `;
      const otherStudentsResult = await db.query(checkOtherStudentsQuery, [
        parent_id,
        student_id,
      ]);
      const otherStudentsCount = parseInt(otherStudentsResult.rows[0].count);

      if (otherStudentsCount === 0) {
        const updateParentQuery = `
          UPDATE parents SET status = 'inactive' WHERE parent_id = $1;
        `;
        await db.query(updateParentQuery, [parent_id]);
      }
    }

    // Step 7: Update status in student_parent table
    const updateStudentParentQuery = `
      UPDATE student_parent SET status = 'inactive' WHERE student_id = $1;
    `;
    await db.query(updateStudentParentQuery, [student_id]);

    // Commit the transaction
    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: `Student with ID ${student_id} has been successfully deactivated.`,
      },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
