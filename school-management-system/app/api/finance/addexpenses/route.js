import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/finance/addexpenses

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("body", body);

    const {
      expense_category,
      recipient_name,
      description,
      amount,
      expense_date,
      invoice_number,
      supplier_id,
      staff_id,
      user_id,
    } = body;

    // Check for required fields
    if (!expense_category || !amount || !expense_date || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if an expense with the same invoice number already exists
    if (invoice_number) {
      const checkInvoiceQuery = `
        SELECT expense_id 
        FROM expenses 
        WHERE LOWER(invoice_number) = LOWER($1);
      `;

      const checkInvoiceResult = await db.query(checkInvoiceQuery, [
        invoice_number,
      ]);

      if (checkInvoiceResult.rows.length > 0) {
        return NextResponse.json(
          { error: "An expense with this invoice number already exists" },
          { status: 409 }
        );
      }
    }

    // Prepare query and values array
    let insertQuery = `
      INSERT INTO expenses (
        expense_category, 
        recipient_name,
        description, 
        amount, 
        expense_date, 
        invoice_number, 
        user_id
    `;
    let values = [
      expense_category,
      recipient_name,
      description,
      amount,
      expense_date,
      invoice_number,
      user_id
    ];

    // Add supplier_id to query and values only if it's not null or empty
    if (supplier_id && supplier_id.trim() !== "") {
      insertQuery += `, supplier_id`;
      values.push(supplier_id);
    }
    
    if (staff_id && staff_id.trim() !== "") {
      insertQuery += `, staff_id`;
      values.push(parseInt(staff_id));
    }

    insertQuery += `) VALUES (${values
      .map((_, index) => `$${index + 1}`)
      .join(", ")}) RETURNING expense_id, expense_category;`;

    const insertResult = await db.query(insertQuery, values);

    const newExpense = insertResult.rows[0];

    if (newExpense) {
      return NextResponse.json(
        {
          message: `Expense in category ${newExpense.expense_category} added successfully`,
          id: newExpense.expense_id,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: `Failed to add expense in category ${expense_category}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error adding expense:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
