import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/inventory/receiveitemmovement

export async function PUT(req) {
  try {
    const body = await req.json();
    const { movement_id, status, returned_at, comments } = body;
console.log('body', body)
    if (!movement_id || !status || !returned_at) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      await db.query("BEGIN");

      // Update the items_movement table
      const updateMovementQuery = `
        UPDATE items_movement
        SET status = $1, returned_at = $2, comments = $3
        WHERE supply_id = $4
        RETURNING item_id, quantity;
      `;
      const updateResult = await db.query(updateMovementQuery, [
        status,
        returned_at,
        comments,
        movement_id,
      ]);

      if (updateResult.rows.length === 0) {
        await db.query("ROLLBACK");
        return NextResponse.json(
          { error: "Movement record not found" },
          { status: 404 }
        );
      }

      const { item_id, quantity } = updateResult.rows[0];

      // Update the items table to increase the quantity_available
      const updateItemQuery = `
        UPDATE items
        SET quantity_available = quantity_available + $1
        WHERE item_id = $2
        RETURNING item_name, quantity_available, restock_level;
      `;
      const itemUpdateResult = await db.query(updateItemQuery, [
        quantity,
        item_id,
      ]);
      const updatedItem = itemUpdateResult.rows[0];

      // Insert notification for item received
      const notification_title = "Item Received";
      const notification_message = `${quantity} ${updatedItem.item_name}(s) have been received.`;
      const notification_type = "inventory";
      const priority = "normal";

      const notificationQuery = `
        INSERT INTO notifications (notification_title, notification_message, notification_type, priority)
        VALUES ($1, $2, $3, $4)
      `;

      await db.query(notificationQuery, [
        notification_title,
        notification_message,
        notification_type,
        priority,
      ]);

      await db.query("COMMIT");

      return NextResponse.json(
        {
          message: "Item received successfully",
          updatedItem: {
            item_name: updatedItem.item_name,
            quantity_available: updatedItem.quantity_available,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error in receiving item:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

