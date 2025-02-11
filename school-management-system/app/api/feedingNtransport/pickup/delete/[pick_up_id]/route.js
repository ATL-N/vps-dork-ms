import { NextResponse } from "next/server";
import db from "../../../../../lib/db";

// /api/feedingNtransport/pickup/delete/[pick_up_id]
export async function DELETE(req, { params }) {
  const { pick_up_id } = params;

  try {
    await db.query("BEGIN");

    // Validate ID format
    const id = parseInt(pick_up_id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid pick-up point ID format" },
        { status: 400 }
      );
    }

    // Get request body for notification
    const body = await req.json();
    const { user_id } = body;

    // 1. Check if pick-up point exists
    const checkExistQuery = `
      SELECT pick_up_id, pick_up_point_name 
      FROM bus_pick_up_points 
      WHERE pick_up_id = $1 AND status != 'deleted';
    `;
    const existResult = await db.query(checkExistQuery, [id]);

    if (existResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Pick-up point not found or already deleted" },
        { status: 404 }
      );
    }

    // 2. Check for active student associations
    const checkStudentsQuery = `
      SELECT s.student_id, s.first_name, s.last_name
      FROM students s
      JOIN feeding_transport_fees f ON s.student_id = f.student_id
      WHERE f.pick_up_point = $1 AND s.status = 'active';
    `;
    const studentResult = await db.query(checkStudentsQuery, [id]);

    if (studentResult.rows.length > 0) {
      const students = studentResult.rows.map(
        (s) => `${s.first_name} ${s.last_name}`
      );
      return NextResponse.json(
        {
          error: "Cannot delete pick-up point with active student associations",
          associatedStudents: students,
        },
        { status: 409 }
      );
    }

    // 3. Perform soft delete
    const softDeleteQuery = `
      UPDATE bus_pick_up_points
      SET status = 'deleted'
      WHERE pick_up_id = $1
      RETURNING pick_up_point_name;
    `;
    const deleteResult = await db.query(softDeleteQuery, [id]);

    if (deleteResult.rowCount === 0) {
      throw new Error("Soft delete failed unexpectedly");
    }

    // 4. Create notification
    const notification_title = `Pick-up point deleted`;
    const notification_message = `Pick-up point "${deleteResult.rows[0].pick_up_point_name}" has been soft deleted from the system.`;

    await db.query(
      `INSERT INTO notifications 
        (notification_title, notification_message, notification_type, priority, sender_id)
       VALUES ($1, $2, 'general', 'normal', $3)`,
      [notification_title, notification_message, user_id]
    );

    await db.query("COMMIT");

    return NextResponse.json(
      { message: "Pick-up point soft deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Soft delete error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
