import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function PUT(req, { params }) {
  const body = await req.json();
  console.log('body', body)
  const { selectedStudents, promotedClass } = body;

  try {
    await db.query("BEGIN");

    // Update class_promoted_to for selected students
    const updateStudentsQuery = `
      UPDATE students
      SET class_promoted_to = $1
      WHERE student_id = ANY($2)
      RETURNING *;
    `;
    const result = await db.query(updateStudentsQuery, [
      promotedClass,
      selectedStudents,
    ]);

    if (result.rows.length === 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "No students were updated" },
        { status: 404 }
      );
    }

    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: "Students promoted successfully",
        updatedStudents: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to promote students" },
      { status: 500 }
    );
  }
}
