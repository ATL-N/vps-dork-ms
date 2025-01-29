import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('body', body)
    const { class_id, semester_id, inventory_items } = body;

    if (!class_id || !semester_id || !inventory_items || inventory_items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields or no inventory items" },
        { status: 400 }
      );
    }

    // Use the pool directly
    // const db = await db.connect();

    try {
      await db.query("BEGIN");

      for (const inventory of inventory_items) {
        const { inventory_name, restock_level, quantity, unit_price, total_price } = inventory;

        if (!inventory_name || !quantity || !unit_price ) {
          return NextResponse.json(
            { error: "Missing required fields in inventory item" },
            { status: 401 }
          );
          // throw new Error("Missing required fields in inventory item");
        }

        const insertQuery = `
          INSERT INTO inventory_items (inventory_name, unit_price, quantity_per_student, total_price, restock_level)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING inventory_id;
        `;

        const insertResult = await db.query(insertQuery, [
          inventory_name,
          unit_price,
          quantity,
          unit_price * quantity,
          restock_level,
        ]);
        const inventory_id = insertResult.rows[0].inventory_id;

        const linkQuery = `
          INSERT INTO inventory_class_semester (inventory_id, class_id, semester_id)
          VALUES ($1, $2, $3);
        `;

        await db.query(linkQuery, [inventory_id, class_id, semester_id]);
      }

      await db.query("COMMIT");

      return NextResponse.json(
        { message: "inventory items added successfully" },
        { status: 201 }
      );
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    } finally {
      // db.release();
    }
  } catch (error) {
        await db.query("ROLLBACK");
    console.error("Error in inventory addition:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
