import db from "../../../../lib/db";
import { NextResponse } from "next/server";


// /api/inventory/suppliers/all
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body in addsupplierapi", body);

    const { supplier_name, contact_name, contact_phone, contact_email, address, details } = body;

    if (!supplier_name || !contact_name || !contact_phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if supplier_name, contact_name,  already exists
    const checkQuery = `
SELECT supplier_id 
FROM suppliers 
WHERE LOWER(supplier_name) = LOWER($1) 
  AND LOWER(contact_name) = LOWER($2) 
  AND contact_phone = $3
  AND status='active';   `;

    const checkResult = await db.query(checkQuery, [supplier_name, contact_name, contact_phone]);

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: "supplier name already exists. Try adding another supplier" },
        { status: 409 } // 409 Conflict
      );
    }

    // If supplier doesn't exist, proceed with insertion
    const insertQuery = `
      INSERT INTO suppliers (supplier_name, contact_name, contact_phone, contact_email, address, details)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING supplier_id, supplier_name ;
    `;

    const insertResult = await db.query(insertQuery, [supplier_name, contact_name, contact_phone, contact_email, address, details]);
    const new_name = insertResult.rows[0].supplier_name;

    console.log(`supplier ${new_name} added successfully`);

    return NextResponse.json(
      { message: `supplier (${new_name}) added successfully`, id: new_name },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
