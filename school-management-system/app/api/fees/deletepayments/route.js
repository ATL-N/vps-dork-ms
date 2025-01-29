// /api/fees/deletepayments/route.js
import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function DELETE(req) {
  try {
    await db.query("BEGIN");

    const { searchParams } = new URL(req.url);
    const payment_id = searchParams.get("payment_id");

    if (!payment_id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Get the payment details before soft delete
    const paymentQuery = `
      SELECT student_id, amount_received, old_balance 
      FROM fee_collections 
      WHERE collection_id = $1 AND status != 'deleted'
    `;
    const paymentResult = await db.query(paymentQuery, [payment_id]);

    if (paymentResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    const { student_id, amount_received, old_balance } = paymentResult.rows[0];

    // Soft delete the fee collection
    const updateFeeQuery = `
      UPDATE fee_collections 
      SET status = 'deleted', 
          updated_at = CURRENT_TIMESTAMP
      WHERE collection_id = $1
    `;
    await db.query(updateFeeQuery, [payment_id]);

    // Revert the student's balance
    const updateStudentQuery = `
      UPDATE students 
      SET amountowed = amountowed + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE student_id = $2
    `;
    await db.query(updateStudentQuery, [amount_received, student_id]);

    await db.query("COMMIT");

    return NextResponse.json(
      { message: "Fee collection deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete fee collection" },
      { status: 500 }
    );
  }
}
