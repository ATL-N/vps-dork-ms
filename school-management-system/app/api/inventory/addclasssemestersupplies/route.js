import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/inventory/addclasssemestersupplies

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body", body);
    const { user_id, class_id, semester_id, supplies } = body;

    if (!class_id || !semester_id || !supplies || supplies.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields or no supplies" },
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
        { error: "User not authorized to perform this operation" },
        { status: 401 }
      );
    }

    try {
      await db.query("BEGIN");

      const itemsToRestock = [];

      for (const supply of supplies) {
        const { student_id, item_id, quantity: newQuantity } = supply;

        if (!student_id || !item_id || newQuantity === undefined) {
          return NextResponse.json(
            { error: "Missing required fields in supply item" },
            { status: 400 }
          );
        }

        // Get the current quantity from items_supply
        const getCurrentQuantityQuery = `
          SELECT COALESCE(SUM(quantity), 0) as current_quantity
          FROM items_supply
          WHERE student_id = $1 AND item_id = $2 AND class_id = $3 AND semester_id = $4
        `;
        const currentQuantityResult = await db.query(getCurrentQuantityQuery, [
          student_id,
          item_id,
          class_id,
          semester_id,
        ]);
        const currentQuantity = parseInt(
          currentQuantityResult.rows[0].current_quantity
        );

        // Calculate the quantity difference
        const quantityDifference = newQuantity - currentQuantity;

        if (quantityDifference === 0) {
          continue; // No change in quantity, skip to next supply
        }

        // Check if the quantity is available before updating
        const checkQuantityQuery = `
          SELECT item_name, quantity_available
          FROM items
          WHERE item_id = $1
        `;
        const checkResult = await db.query(checkQuantityQuery, [item_id]);
        const item = checkResult.rows[0];

        if (item.quantity_available < quantityDifference) {
          await db.query("ROLLBACK");
          return NextResponse.json(
            {
              error: "Insufficient quantity available",
              item: item.item_name,
              available: item.quantity_available,
              requested: quantityDifference,
            },
            { status: 400 }
          );
        }

        // Insert or update the items_supply table
        const upsertQuery = `
          INSERT INTO items_supply (student_id, item_id, quantity, supplied_by, semester_id, class_id)
          VALUES ($1, $2, $3, $4, $5, $6)
          
          RETURNING supply_id;
        `;

        const upsertResult = await db.query(upsertQuery, [
          student_id,
          item_id,
          quantityDifference,
          staff_id,
          semester_id,
          class_id,
        ]);
        const supply_id = upsertResult.rows[0].supply_id;

        // Update the items table and check if restock is needed
        const updateAndCheckItemQuery = `
          UPDATE items
          SET quantity_available = quantity_available - $1
          WHERE item_id = $2
          RETURNING item_name, quantity_available, restock_level;
        `;

        const updateResult = await db.query(updateAndCheckItemQuery, [
          quantityDifference,
          item_id,
        ]);
        const updatedItem = updateResult.rows[0];

        if (updatedItem.quantity_available <= updatedItem.restock_level) {
          itemsToRestock.push(updatedItem.item_name);
        }
      }

      // Insert notification for class supplies addition
      const notification_title = "Class Supplies Updated";
      const notification_message = `Supplies for class ${class_id} in semester ${semester_id} have been updated.`;
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

      // Insert restock notifications if needed
      if (itemsToRestock.length > 0) {
        const restock_notification_title = "Items Need Restocking";
        const restock_notification_message = `The following items need to be restocked: ${itemsToRestock.join(
          ", "
        )}`;
        const restock_notification_type = "inventory";
        const restock_priority = "high";

        await db.query(notificationQuery, [
          restock_notification_title,
          restock_notification_message,
          restock_notification_type,
          restock_priority,
          user_id,
        ]);
      }

      await db.query("COMMIT");

      return NextResponse.json(
        {
          message: "Class semester supplies updated successfully",
          itemsToRestock: itemsToRestock.length > 0 ? itemsToRestock : null,
        },
        { status: 201 }
      );
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error in updating class semester supplies:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
