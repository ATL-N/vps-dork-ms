import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/parents/deleteParent/[id]
export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();
  const { user_id } = body;

  try {
    await db.query("BEGIN");

    // First check if the parent exists and is not already deleted
    const checkParentQuery = `
      SELECT other_names, last_name 
      FROM parents 
      WHERE parent_id = $1 AND status != 'deleted'
    `;
    const parentResult = await db.query(checkParentQuery, [id]);

    if (parentResult.rows.length === 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "Parent not found or already deleted" },
        { status: 404 }
      );
    }

    // Check for associated students through the student_parent table
    const checkStudentsQuery = `
      SELECT COUNT(*) as student_count
      FROM student_parent sp
      JOIN students s ON sp.student_id = s.student_id
      WHERE sp.parent_id = $1 AND s.status = 'active'
    `;
    const studentResult = await db.query(checkStudentsQuery, [id]);
    const studentCount = parseInt(studentResult.rows[0].student_count);

    if (studentCount > 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        {
          error: `Cannot delete parent as they currently have ${studentCount} active student${
            studentCount === 1 ? "" : "s"
          } associated with them. Please remove all student associations before deleting the parent.`,
        },
        { status: 400 }
      );
    }

    // If no active students are associated, proceed with parent deletion
    const updateParentQuery = `
      UPDATE parents
      SET status = 'deleted'
      WHERE parent_id = $1
      RETURNING parent_id, other_names, last_name
    `;
    const updateResult = await db.query(updateParentQuery, [id]);
    const { other_names, last_name } = updateResult.rows[0];

    // Create notification
    const notification_title = `Parent Removed`;
    const notification_message = `Parent ${other_names} ${last_name} has been removed from the system.`;
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
        message: `${other_names} ${last_name} has been successfully removed from the system.`,
      },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to process parent deletion request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
