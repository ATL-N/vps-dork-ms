import db from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { class_id, attendance_date, attendance, semester_id } = body;

    if (!id || !class_id || !attendance_date || !attendance || !semester_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      await db.query("BEGIN");

      for (const record of attendance) {
        const { student_id, status } = record;
        const updateQuery = `
          UPDATE attendance
          SET status = $1
          WHERE student_id = $2 AND class_id = $3 AND attendance_date = $4 AND semester_id = $5;
        `;
        await db.query(updateQuery, [
          status,
          student_id,
          class_id,
          attendance_date,
          semester_id,
        ]);
      }

      await db.query("COMMIT");
      return NextResponse.json(
        { message: "Attendance updated successfully" },
        { status: 200 }
      );
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error in attendance update:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
