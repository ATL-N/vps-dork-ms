import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function PUT(req) {
  try {
    await db.query("BEGIN");
    const body = await req.json();
    console.log("body", body);

    const {
      payment_id,
      student_id,
      payment_date,
      amount_received,
      fee_type,
      payment_mode,
      received_by,
      new_balance,
      comments,
      phone,
      sendSMS,
      old_balance,
    } = body;

    if (!payment_id || !payment_date || !amount_received) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First, check if this is the latest transaction for this student
    const latestTransactionQuery = `
      SELECT collection_id 
      FROM fee_collections 
      WHERE student_id = $1 
      AND status != 'deleted'
      ORDER BY payment_date DESC, created_at DESC, collection_id DESC 
      LIMIT 1
    `;
    const latestTransactionResult = await db.query(latestTransactionQuery, [
      student_id,
    ]);

    if (
      latestTransactionResult.rows.length > 0 &&
      latestTransactionResult.rows[0].collection_id !== payment_id
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot update this payment as there are more recent transactions for this student. This could affect the balance calculation.",
          latestTransactionId: latestTransactionResult.rows[0].collection_id,
        },
        { status: 400 }
      );
    }

    // Get the original fee collection record
    const originalFeeQuery = `
      SELECT amount_received, student_id 
      FROM fee_collections 
      WHERE collection_id = $1 
      AND status != 'deleted'
    `;
    const originalFeeResult = await db.query(originalFeeQuery, [payment_id]);

    if (originalFeeResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Fee collection record not found" },
        { status: 404 }
      );
    }

    const originalAmount = originalFeeResult.rows[0].amount_received;

    // Fetch student details
    const studentQuery =
      "SELECT first_name, last_name, other_names FROM students WHERE student_id = $1";
    const studentResult = await db.query(studentQuery, [student_id]);
    const student = studentResult.rows[0];

    // Fetch receiver details
    const receiverQuery =
      "SELECT first_name, last_name FROM staff WHERE user_id = $1";
    const receiverResult = await db.query(receiverQuery, [received_by]);
    const receiver = receiverResult.rows[0];

    // Update fee_collections
    const updateFeeQuery = `
      UPDATE fee_collections 
      SET 
        payment_date = $1,
        amount_received = $2,
        old_balance = $3,
        new_balance = $4,
        fee_type = $5,
        payment_mode = $6,
        received_by = $7,
        comment = $8
      WHERE collection_id = $9
      RETURNING *;
    `;

    const feeCollectionResult = await db.query(updateFeeQuery, [
      payment_date,
      amount_received,
      old_balance,
      new_balance,
      fee_type,
      payment_mode,
      received_by,
      comments,
      payment_id,
    ]);

    const collection_id = feeCollectionResult.rows[0].collection_id;

    // Update student balance
    const updateStudentQuery = `
      UPDATE students 
      SET amountowed = $1 
      WHERE student_id = $2
    `;
    await db.query(updateStudentQuery, [new_balance, student_id]);

    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: "Fee collection updated successfully",
        collection_id: collection_id,
        new_balance: new_balance,
        receipt_data: {
          student_name: `${student.first_name} ${student.last_name} ${student.other_names}`,
          payment_date,
          amount_received,
          old_balance,
          new_balance,
          fee_type,
          payment_mode,
          receiver_name: `${receiver.first_name} ${receiver.last_name}`,
          comments,
          collection_id: collection_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update fee collection" },
      { status: 500 }
    );
  }
}
