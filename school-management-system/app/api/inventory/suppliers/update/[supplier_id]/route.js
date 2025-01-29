// /api/inventory/suppliers/update/[supplier_id]
import { NextResponse } from "next/server";
import db from "../../../../../lib/db";


export async function PUT(req, { params }) {
  const { supplier_id } = params;

  // console.log("supplier_id", supplier_id);

  try {
    await db.query("BEGIN");

    const body = await req.json();
    console.log("body in addsupplierapi", body);

    const {
      supply_id,
      supplier_name,
      contact_name,
      contact_phone,
      contact_email,
      address,
      details,
      user_id
    } = body;


    if (!supply_id || !supplier_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (supply_id != supplier_id) {
      return NextResponse.json(
        {
          error:
            "You are not authorised to perform this update. Contact the administrator",
        },
        { status: 400 }
      );
    }

    // Check if the Supplier exists
    const checkExistQuery = `
      SELECT supplier_id FROM suppliers WHERE supplier_id = $1;
    `;

    const existResult = await db.query(checkExistQuery, [supplier_id]);

    if (existResult.rows.length === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    // Check if the new Supplier name already exists (excluding the current Supplier)
    const checkDuplicateQuery = `
      SELECT supplier_id FROM suppliers 
      WHERE LOWER(supplier_name) = LOWER($1) AND supplier_id != $2;
    `;

    const duplicateResult = await db.query(checkDuplicateQuery, [
      supplier_name,
      supplier_id,
    ]);

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Supplier name already exists. Choose a different name." },
        { status: 409 } // 409 Conflict
      );
    }

    // If checks pass, proceed with the update
    const updateQuery = `
      UPDATE suppliers 
      SET supplier_name = $1, contact_name = $2, contact_phone = $3, contact_email = $4, address = $5, details = $6
      WHERE supplier_id = $7
      RETURNING supplier_id, supplier_name;
    `;

    const updateResult = await db.query(updateQuery, [
      supplier_name,
      contact_name,
      contact_phone,
      contact_email,
      address,
      details,
      supplier_id,
    ]);
    const { itemId, itemName } = updateResult.rows[0];

    // Create a notification for the soft delete
    const notification_title = `Supplier updated`;
    const notification_message = `Supplier ${supplier_name} has been updated the system.`;
    const notification_type = "general";
    const priority = "normal";
    // const sender_id = user_id; // You might want to change this to the supplier_id of the user performing the deletion

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

    console.log(`Supplier ${supplier_id} updated successfully`);
    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: `Supplier (${supplier_name}) updated successfully`,
        supplier: itemName,
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
