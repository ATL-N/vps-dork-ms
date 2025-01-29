import { NextResponse } from "next/server";
import db from "../../../../lib/db"; // Adjust the import path as needed

// localhost:3000/api/item/deleteitem/[id]
//  /api/inventory/deleteitem/[item_id]/route.js

export async function PUT(req, { params }) {
  const { id } = params;

  const body = await req.json();
  console.log("body in addsubjectapi", body);

  const { user_id } = body;

  try {
    await db.query("BEGIN");

    // Update item status to 'deleted'
    const updateStaffQuery = `
      UPDATE items
      SET status = 'deleted'
      WHERE item_id = $1
      RETURNING item_id, item_name;
    `;

    const staffResult = await db.query(updateStaffQuery, [id]);

    if (staffResult.rows.length === 0) {
      await db.query("ROLLBACK");
      return NextResponse.json(
        { error: "item not found" },
        { status: 404 }
      );
    }

    const { item_id, item_name } = staffResult.rows[0];

    // Create a notification for the soft delete
    const notification_title = `item Removed`;
    const notification_message = `item ${item_name} has been removed from the system.`;
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
      user_id,
    ]);

    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: `${item_name} has been successfully removed from the system.`,
      },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 }
    );
  }
}
