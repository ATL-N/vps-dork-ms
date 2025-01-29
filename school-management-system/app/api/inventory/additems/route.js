import db from "../../../lib/db";
import { NextResponse } from "next/server";

//  /api/inventory/additems/route.js

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('body', body)
    const { inventory_items } = body;

    if ( !inventory_items || inventory_items.length === 0) {
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
        const {
          inventory_name,
          category,
          restock_level,
          quantity_available,
          quantity_desired,
          unit_price,
        } = inventory; 

        if (
          !inventory_name ||
          !quantity_available ||
          !quantity_desired ||
          !unit_price
        ) {
          return NextResponse.json(
            { error: "Missing required fields in inventory item" },
            { status: 401 }
          );
          // throw new Error("Missing required fields in inventory item");
        }

        const insertQuery = `
          INSERT INTO items (item_name, category, restock_level, quantity_available, quantity_desired, unit_price)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING item_id;
        `;

        const insertResult = await db.query(insertQuery, [
          inventory_name,
          category,
          restock_level,
          quantity_available,
          quantity_desired,
          unit_price,
        ]);
        const item_id = insertResult.rows[0].item_id;

        // const linkQuery = `
        //   INSERT INTO inventory_class_semester (item_id, class_id, semester_id)
        //   VALUES ($1, $2, $3);
        // `;

        // await db.query(linkQuery, [item_id, class_id, semester_id]);
      }

      await db.query("COMMIT");

      return NextResponse.json(
        { message: "Items added successfully" },
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
