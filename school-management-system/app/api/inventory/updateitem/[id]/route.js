import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/inventory/updateitem/[id]/route.js

export async function PUT(req, { params }) {
  const { id } = params;

  // console.log("id", id);

  try {
    await db.query("BEGIN");

    const body = await req.json();
    console.log("body in updateSubjectApi", body);

    const {
      item_id,
      item_name,
      category,
      unit_price,
      quantity_desired,
      quantity_available,
      restock_level,
      status,
      user_id,
    } = body;

    if (!id || !item_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (id != item_id && user_id) {
      return NextResponse.json(
        {
          error:
            "You are not authorised to perform this update. Contact the administrator",
        },
        { status: 400 }
      );
    }

    // Check if the Item exists
    const checkExistQuery = `
      SELECT item_id FROM items WHERE item_id = $1;
    `;

    const existResult = await db.query(checkExistQuery, [id]);

    if (existResult.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if the new item name already exists (excluding the current Item)
    const checkDuplicateQuery = `
      SELECT item_id FROM items 
      WHERE LOWER(item_name) = LOWER($1) AND item_id != $2;
    `;

    const duplicateResult = await db.query(checkDuplicateQuery, [
      item_name,
      id,
    ]);

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Item name already exists. Choose a different name." },
        { status: 409 } // 409 Conflict
      );
    }

    // If checks pass, proceed with the update
    const updateQuery = `
      UPDATE items 
      SET item_name = $1, category = $2, unit_price = $3, quantity_desired = $4, quantity_available = $5, restock_level = $6, status = $7
      WHERE item_id = $8
      RETURNING item_id, item_name;
    `;

    const updateResult = await db.query(updateQuery, [
      item_name,
      category,
      unit_price,
      quantity_desired,
      quantity_available,
      restock_level,
      status,
      id,
    ]);
    const { itemId, itemName } = updateResult.rows[0];

    // Create a notification for the soft delete
    const notification_title = `item updated`;
    const notification_message = `Item ${item_name} has been updated the system. the current status is ${status}`;
    const notification_type = "general";
    const priority = "normal";
    // const sender_id = user_id; // You might want to change this to the ID of the user performing the deletion

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

    console.log(`Item ${id} updated successfully`);
    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: `Item (${item_name}) updated successfully`,
        Item: itemName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
