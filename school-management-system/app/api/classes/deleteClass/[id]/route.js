import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();
  const { user_id } = body;

  try {
    if (id == 1) {
      return NextResponse.json(
        {
          error:
            "Cannot delete the completed class as it is essential for the system",
        },
        { status: 400 }
      );
    }

    await db.query("BEGIN");

    // First check if the class exists
    const checkClassQuery = `
      SELECT class_name 
      FROM classes 
      WHERE class_id = $1 AND status != 'deleted'
    `;
    const classResult = await db.query(checkClassQuery, [id]);

    if (classResult.rows.length === 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "Class not found or already deleted" },
        { status: 404 }
      );
    }

    // Check for active students in the class
    const checkStudentsQuery = `
      SELECT COUNT(*) as student_count
      FROM students
      WHERE class_id = $1 AND status = 'active'
    `;
    const studentResult = await db.query(checkStudentsQuery, [id]);
    const studentCount = parseInt(studentResult.rows[0].student_count);

    if (studentCount > 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        {
          error: `Cannot delete class as it currently has ${studentCount} active student${
            studentCount === 1 ? "" : "s"
          }. Please reassign or remove all students before deleting the class.`,
        },
        { status: 400 }
      );
    }

    // If no active students, proceed with class deletion
    const updateClassQuery = `
      UPDATE classes
      SET status = 'deleted'
      WHERE class_id = $1 
      RETURNING class_id, class_name
    `;
    const updateResult = await db.query(updateClassQuery, [id]);
    const { class_name } = updateResult.rows[0];

    // Create notification
    const notification_title = `Class Removed`;
    const notification_message = `Class ${class_name} has been removed from the system.`;
    const notificationQuery = `
      INSERT INTO notifications (
        notification_title, 
        notification_message, 
        notification_type, 
        priority, 
        sender_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING notification_id
    `;
    await db.query(notificationQuery, [
      notification_title,
      notification_message,
      "general",
      "normal",
      user_id,
    ]);

    await db.query("COMMIT");
    return NextResponse.json(
      {
        message: `${class_name} has been successfully removed from the system.`,
      },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to process class deletion request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
