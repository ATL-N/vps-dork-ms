import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/inventory/additemmovement

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body", body);
    const { user_id, formData, inventory_items } = body;

    if (!formData || !inventory_items || inventory_items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields or no items" },
        { status: 400 }
      );
    }

    const {
      staff_id,
      recipient_name,
      recipient_phone,
      comments,
      movement_type,
    } = formData;

    if (staff_id) {
      if (!staff_id || !movement_type) {
        return NextResponse.json(
          { error: "Missing required fields in staff name or movement type" },
          { status: 400 }
        );
      }
    } 
    
    if(!staff_id){
      if (!recipient_name || !movement_type) {
        return NextResponse.json(
          {
            error:
              "Missing required fields in recipient name, recipient phone or movement type",
          },
          { status: 401 }
        );
      }
    }





    try {
      await db.query("BEGIN");

      const itemsToRestock = [];

      for (const item of inventory_items) {
        const { item_id, quantity, item_status, unit_price } = item;

        if (!item_id || quantity === undefined) {
          return NextResponse.json(
            { error: "Missing required fields in inventory item" },
            { status: 400 }
          );
        }

        // Check if the quantity is available before updating
        const checkQuantityQuery = `
          SELECT item_name, quantity_available
          FROM items
          WHERE item_id = $1
        `;
        const checkResult = await db.query(checkQuantityQuery, [parseInt(item_id)]);
        const itemData = checkResult.rows[0];

        if (parseInt(itemData.quantity_available) < parseInt(quantity)) {
          await db.query("ROLLBACK");
          return NextResponse.json(
            {
              error: "Insufficient quantity available",
              item: itemData.item_name,
              available: itemData.quantity_available,
              requested: quantity,
            },
            { status: 400 }
          );
        }

        console.log("check if the quantity is available before updating");

        // Insert into items_movement table
        const insertMovementQuery = `
          INSERT INTO items_movement (staff_id, recipient_name, recipient_phone, comments, item_id, quantity, supplied_by, movement_type, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING supply_id;
        `;

                console.log(
                  "check if the quantity is available before updating222"
                );

// if(staff_id){

// }
        const insertResult = await db.query(insertMovementQuery, [
          staff_id || null,
          recipient_name,
          parseInt(recipient_phone),
          comments,
          item_id,
          parseInt(quantity),
          user_id,
          movement_type,
          item_status,
        ]);

                console.log(
                  "check if the quantity is available before updating444"
                );


        const supply_id = insertResult.rows[0].supply_id;

                console.log("Insert into items_movement table");


        // Update the items table and check if restock is needed
        const updateAndCheckItemQuery = `
          UPDATE items
          SET quantity_available = quantity_available - $1
          WHERE item_id = $2
          RETURNING item_name, quantity_available, restock_level;
        `;

        const updateResult = await db.query(updateAndCheckItemQuery, [
          quantity,
          item_id,
        ]);
        const updatedItem = updateResult.rows[0];

        if (updatedItem.quantity_available <= updatedItem.restock_level) {
          itemsToRestock.push(updatedItem.item_name);
        }
      }
      console.log("Update the items table and check if restock is needed");

      // Insert notification for item movement
      const notification_title = "Item Movement Recorded";
      const notification_message = `${inventory_items.length} item(s) have been moved. Movement type: ${movement_type}`;
      const notification_type = "inventory";
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
          message: "Item movement recorded successfully",
          itemsToRestock: itemsToRestock.length > 0 ? itemsToRestock : null,
        },
        { status: 201 }
      );
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error in recording item movement:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
