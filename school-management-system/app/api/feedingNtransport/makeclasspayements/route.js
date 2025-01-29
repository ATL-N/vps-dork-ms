import { NextResponse } from "next/server";
import db from "../../../lib/db";

// POST /api/feedingNtransport/makeclasspayements
export async function POST(req) {
  try {
    const payload = await req.json();

    // Validate request body
    if (!Array.isArray(payload)) {
      return NextResponse.json(
        { error: "Request body must be an array of payments" },
        { status: 400 }
      );
    }

    // Get current semester
    const semesterQuery = `
      SELECT semester_id 
      FROM semesters 
      WHERE status = 'active' 
      LIMIT 1
    `;

    const semesterResult = await db.query(semesterQuery);
    if (semesterResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No active semester found" },
        { status: 400 }
      );
    }
    const semester_id = semesterResult.rows[0].semester_id;

    // Begin transaction
    await db.query("BEGIN");

    const insertQuery = `
      INSERT INTO feeding_fee_payments (
        student_id,
        class_id,
        collected_by,
        feeding_fee,
        valid_until_feeding,
        transport_fee,
        valid_until_transport,
        total_fee,
        semester_id,
        payment_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id;
    `;

    const results = [];
    const errors = [];

    // Process each payment
    for (const payment of payload) {
      try {
        // Skip if no fees are being paid
        if (
          (!payment.current_feeding_fee ||
            payment.current_feeding_fee === "") &&
          (!payment.current_transport_fee ||
            payment.current_transport_fee === "")
        ) {
          continue;
        }

        // Validate required fields
        if (!payment.student_id || !payment.class_id || !payment.collected_by) {
          throw new Error(
            `Missing required fields for student ${payment.student_id}`
          );
        }

        // Calculate total fee
        const feedingFee = payment.current_feeding_fee
          ? parseFloat(payment.current_feeding_fee)
          : 0;
        const transportFee = payment.current_transport_fee
          ? parseFloat(payment.current_transport_fee)
          : 0;
        const totalFee = feedingFee + transportFee;

        // Insert the payment
        const result = await db.query(insertQuery, [
          payment.student_id,
          payment.class_id,
          payment.collected_by,
          feedingFee,
          payment.feeding_valid_until || null,
          transportFee,
          payment.transport_valid_until || null,
          totalFee,
          semester_id,
          payment.payment_date || new Date(),
        ]);

        results.push({
          student_id: payment.student_id,
          payment_id: result.rows[0].id,
          status: "success",
        });
      } catch (error) {
        errors.push({
          student_id: payment.student_id,
          error: error.message,
        });
      }
    }

    if (errors.length === 0) {
      await db.query("COMMIT");
      return NextResponse.json(
        {
          message: "Payments processed successfully",
          results,
        },
        { status: 200 }
      );
    } else {
      await db.query("ROLLBACK");
      return NextResponse.json(
        {
          error: "Some payments failed to process",
          errors,
          successful: results,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
