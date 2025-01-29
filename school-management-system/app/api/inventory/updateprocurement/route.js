import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/inventory/updateprocurement

export async function PUT(req) {
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
        { error: "Missing required fields or no procured items" },
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

      // First, fetch the existing procurement data
      const fetchExistingQuery = `
        SELECT procurement_id, item_id, quantity, unit_cost
        FROM procurements
        WHERE supplier_id = $1 AND procurement_date = $2;
      `;
      const existingProcurements = await db.query(fetchExistingQuery, [
        supplier_id,
        selected_date,
      ]);
      const existingItems = existingProcurements.rows.reduce((acc, item) => {
        acc[item.item_id] = item;
        return acc;
      }, {});

      for (const procured_item of procured_items) {
        const { item_id, unit_price, unit_cost, quantity, total_cost } =
          procured_item;

        if (!item_id || !quantity || !unit_cost) {
          return NextResponse.json(
            { error: "Missing required fields in procured item" },
            { status: 400 }
          );
        }

        if (existingItems[item_id]) {
          // Update existing procurement
          const updateQuery = `
            UPDATE procurements
            SET unit_cost = $1, quantity = $2, total_cost = $3
            WHERE procurement_id = $4;
          `;
          await db.query(updateQuery, [
            unit_cost,
            quantity,
            unit_cost * quantity,
            existingItems[item_id].procurement_id,
          ]);

          // Update item quantity
          const quantityDiff = quantity - existingItems[item_id].quantity;
          const updateItemQuery = `
            UPDATE items
            SET unit_price = $1,
                quantity_available = quantity_available + $2
            WHERE item_id = $3;
          `;
          await db.query(updateItemQuery, [unit_price, quantityDiff, item_id]);

          // Remove this item from existingItems
          delete existingItems[item_id];
        } else {
          // Insert new procurement
          const insertQuery = `
            INSERT INTO procurements (item_id, supplier_id, unit_cost, quantity, total_cost, procurement_date, received_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING procurement_id;
          `;
          await db.query(insertQuery, [
            item_id,
            supplier_id,
            unit_cost,
            quantity,
            unit_cost * quantity,
            selected_date,
            staff_id,
          ]);

          // Update item quantity
          const updateItemQuery = `
            UPDATE items
            SET unit_price = $1,
                quantity_available = quantity_available + $2
            WHERE item_id = $3;
          `;
          await db.query(updateItemQuery, [unit_price, quantity, item_id]);
        }
      }

      // Remove any procurements that were in the original list but not in the updated list
      for (const itemId in existingItems) {
        const deleteQuery = `
          DELETE FROM procurements
          WHERE procurement_id = $1;
        `;
        await db.query(deleteQuery, [existingItems[itemId].procurement_id]);

        // Update item quantity
        const updateItemQuery = `
          UPDATE items
          SET quantity_available = quantity_available - $1
          WHERE item_id = $2;
        `;
        await db.query(updateItemQuery, [
          existingItems[itemId].quantity,
          itemId,
        ]);
      }

      const notification_title = "Procurement Updated";
      const notification_message = `A procurement for supplier ${supplier_id} on ${selected_date} has been updated.`;
      const notification_type = "general";
      const priority = "normal";

      const notificationQuery = `
        INSERT INTO notifications (notification_title, notification_message, notification_type, priority, sender_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING notification_id, notification_title;
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
          message:
            "Procurement updated successfully and item quantities adjusted",
        },
        { status: 200 }
      );
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error in procurement update:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

