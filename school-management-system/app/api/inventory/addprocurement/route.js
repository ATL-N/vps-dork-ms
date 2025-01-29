import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/inventory/addprocurement

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body", body);
    const { user_id, supplier_id, selected_date, procured_items } = body;

    if (
      !supplier_id ||
      !selected_date ||
      !procured_items ||
      procured_items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields or no procured item items" },
        { status: 400 }
      );
    }

    const sqlQuery = `
        SELECT 
          s.staff_id
        FROM 
           staff s
        WHERE s.status = 'active' AND s.user_id=$1
      `;

    const { rows } = await db.query(sqlQuery, [user_id]);
    console.log("rows", rows[0].staff_id);
    const staff_id = rows[0].staff_id;

    if (!staff_id) {
      return NextResponse.json(
        { error: "User not authorised to perform this operation" },
        { status: 401 }
      );
    }

    try {
      await db.query("BEGIN");

      for (const procured_item of procured_items) {
        const { item_id, unit_price, unit_cost, quantity, total_cost } =
          procured_item;

        if (!item_id || !quantity || !unit_cost) {
          return NextResponse.json(
            { error: "Missing required fields in procured item item" },
            { status: 401 }
          );
        }

        const insertQuery = `
          INSERT INTO procurements (item_id, supplier_id, unit_cost, quantity, total_cost, procurement_date, received_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING procurement_id;
        `;

        const insertResult = await db.query(insertQuery, [
          item_id,
          supplier_id,
          unit_cost,
          quantity,
          unit_cost * quantity,
          selected_date,
          staff_id,
        ]);
        const procurement_id = insertResult.rows[0].procurement_id;

        // Update the items table with the new unit price
        const updateItemQuery = `
          UPDATE items
          SET unit_price = $1,
              quantity_available = quantity_available + $2
          WHERE item_id = $3;
        `;

        await db.query(updateItemQuery, [unit_price, quantity, item_id]);

        const notification_title = "New Procurement completed";
        const notification_message = `A new procurement worth(${
          unit_cost * quantity
        }) completed.`;
        const notification_type = "general";
        const priority = "normal";

        const notificationQuery = `
        INSERT INTO notifications (notification_title, notification_message, notification_type, priority, sender_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING notification_id, notification_title;
        `;

        const result = await db.query(notificationQuery, [
          notification_title,
          notification_message,
          notification_type,
          priority,
          user_id,
        ]);
      }

      await db.query("COMMIT");

      return NextResponse.json(
        {
          message: "Procured items added successfully and item prices updated",
        },
        { status: 201 }
      );
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error in procurement addition:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
