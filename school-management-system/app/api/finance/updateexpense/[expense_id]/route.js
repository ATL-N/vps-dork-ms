import db from "../../../../lib/db";
import { NextResponse } from "next/server";

// /api/finance/updateexpense/[expense_id]/route.js

export async function PUT(req, { params }) {
  try {
    const { expense_id } = params;
    const body = await req.json();
    console.log("Updating expense:", expense_id, body);

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

    // Check if the expense exists
    const checkExpenseQuery = "SELECT * FROM expenses WHERE expense_id = $1";
    const checkExpenseResult = await db.query(checkExpenseQuery, [expense_id]);

    if (checkExpenseResult.rows.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Check if an expense with the same invoice number already exists (excluding the current expense)
    if (invoice_number) {
      const checkInvoiceQuery = `
        SELECT expense_id 
        FROM expenses 
        WHERE LOWER(invoice_number) = LOWER($1) AND expense_id != $2;
      `;

      const checkInvoiceResult = await db.query(checkInvoiceQuery, [
        invoice_number,
        expense_id,
      ]);

      if (checkInvoiceResult.rows.length > 0) {
        return NextResponse.json(
          { error: "Another expense with this invoice number already exists" },
          { status: 409 }
        );
      }
    }

    // Prepare update query and values array
    let updateQuery = `
      UPDATE expenses SET
        expense_category = $1,
        recipient_name = $2,
        description = $3,
        amount = $4,
        expense_date = $5,
        invoice_number = $6,
        user_id = $7,
        supplier_id = $8,
        staff_id = $9
      WHERE expense_id = $10
      RETURNING expense_id, expense_category;
    `;

    const values = [
      expense_category,
      recipient_name,
      description,
      amount,
      expense_date,
      invoice_number,
      user_id,
      supplier_id || null,
      staff_id || null,
      expense_id,
    ];

    const updateResult = await db.query(updateQuery, values);

    const updatedExpense = updateResult.rows[0];

    if (updatedExpense) {
      return NextResponse.json(
        {
          message: `Expense in category ${updatedExpense.expense_category} updated successfully`,
          id: updatedExpense.expense_id,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: `Failed to update expense in category ${expense_category}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
