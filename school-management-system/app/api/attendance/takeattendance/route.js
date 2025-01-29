import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/attendance/takeattenadance

export async function POST(req) {
  try {
    const body = await req.json();
    // console.log('this is the body', body)
    const { class_id, attendance_date, attendance, semester_id, user_id } = body;

    if (!class_id || !attendance_date || !attendance || !semester_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      await db.query("BEGIN");

      for (const record of attendance) {
        const { student_id, status } = record;
        const insertQuery = `
          INSERT INTO attendance (student_id, class_id, attendance_date, status, semester_id, staff_id)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (student_id, class_id, attendance_date) 
          DO UPDATE SET status = EXCLUDED.status;
        `;
        await db.query(insertQuery, [
          student_id,
          class_id,
          attendance_date,
          status,
          semester_id,
          user_id
        ]);
      }

      await db.query("COMMIT");
      return NextResponse.json(
        { message: "Attendance submitted successfully" },
        { status: 201 }
      );
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error in attendance submission:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
