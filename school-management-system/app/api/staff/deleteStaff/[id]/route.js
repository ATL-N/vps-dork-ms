import { NextResponse } from "next/server";
import db from "../../../../lib/db"; // Adjust the import path as needed

// localhost:3000/api/staff/deleteStaff/[id]

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    await db.query("BEGIN");

    // Update staff status to 'deleted'
    const updateStaffQuery = `
      UPDATE staff
      SET status = 'deleted'
      WHERE staff_id = $1
      RETURNING staff_id, first_name, last_name, user_id;
    `;

    const staffResult = await db.query(updateStaffQuery, [id]);

    if (staffResult.rows.length === 0) {
      await db.query("ROLLBACK");
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const { user_id, first_name, last_name } = staffResult.rows[0];

    // Update user status to 'inactive'
    const updateUserQuery = `
      UPDATE users
      SET status = 'inactive'
      WHERE user_id = $1;
    `;

    await db.query(updateUserQuery, [user_id]);

    // Create a notification for the soft delete
    const notification_title = "Staff Member Removed";
    const notification_message = `Staff member ${first_name} ${last_name} has been removed from the system.`;
    const notification_type = "general";
    const priority = "normal";
    const sender_id = user_id; // You might want to change this to the ID of the user performing the deletion

    const notificationQuery = `
      INSERT INTO notifications (notification_title, notification_message, notification_type, priority, sender_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING notification_id;
    `;

    await db.query(notificationQuery, [
      notification_title,
      notification_message,
      notification_type,
      priority,
      sender_id,
    ]);

    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: `${first_name} ${last_name} has been successfully removed from the system.`,
        staff_id: id,
        user_id: user_id,
      },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to remove staff member" },
      { status: 500 }
    );
  }
}
