import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { class_id, semester_id, invoices } = body;

    if (!class_id || !semester_id || !invoices || invoices.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields or no invoice items" },
        { status: 400 }
      );
    }

    try {
      await db.query("BEGIN");

      // Check for existing invoices
      const checkExistingQuery = `
        SELECT SUM(i.amount) as total_amount
        FROM invoices i
        JOIN invoice_class_semester ics ON i.invoice_id = ics.invoice_id
        WHERE ics.class_id = $1 AND ics.semester_id = $2;
      `;
      const existingResult = await db.query(checkExistingQuery, [
        class_id,
        semester_id,
      ]);
      const oldTotalAmount = existingResult.rows[0].total_amount || 0;

      // Remove existing invoices if they exist
      if (oldTotalAmount > 0) {
        const deleteLinksQuery = `
          DELETE FROM invoice_class_semester
          WHERE class_id = $1 AND semester_id = $2
          RETURNING invoice_id;
        `;
        const deleteLinksResult = await db.query(deleteLinksQuery, [
          class_id,
          semester_id,
        ]);
        const deletedInvoiceIds = deleteLinksResult.rows.map(
          (row) => row.invoice_id
        );

        if (deletedInvoiceIds.length > 0) {
          const deleteInvoicesQuery = `
            DELETE FROM invoices
            WHERE invoice_id = ANY($1::int[]);
          `;
          await db.query(deleteInvoicesQuery, [deletedInvoiceIds]);
        }
      }

      let newTotalAmount = 0;

      for (const invoice of invoices) {
        const { description, amount } = invoice;

        if (!description || !amount) {
          throw new Error("Missing required fields in invoice item");
        }

        newTotalAmount += parseFloat(amount);

        const insertQuery = `
          INSERT INTO invoices (description, amount)
          VALUES ($1, $2)
          RETURNING invoice_id;
        `;

        const insertResult = await db.query(insertQuery, [description, amount]);
        const invoice_id = insertResult.rows[0].invoice_id;

        const linkQuery = `
          INSERT INTO invoice_class_semester (invoice_id, class_id, semester_id)
          VALUES ($1, $2, $3);
        `;

        await db.query(linkQuery, [invoice_id, class_id, semester_id]);
      }

      // Calculate the difference in total amount
      const amountDifference = newTotalAmount - oldTotalAmount;

      // Update the amountowed for all students in the class
      const updateStudentsQuery = `
        UPDATE students
        SET amountowed = amountowed + $1
        WHERE class_promoted_to = $2
        RETURNING student_id;
      `;

      const updateResult = await db.query(updateStudentsQuery, [
        amountDifference,
        class_id,
      ]);
      const studentsAffected = updateResult.rowCount;

      // Log the balance adjustment for each affected student
      for (const row of updateResult.rows) {
        const logQuery = `
          INSERT INTO balance_adjustment_log (student_id, amount_adjusted, reason)
          VALUES ($1, $2, $3);
        `;
        await db.query(logQuery, [
          row.student_id,
          amountDifference,
          `Invoice update for class ${class_id} and semester ${semester_id}`,
        ]);
      }

      await db.query("COMMIT");

      return NextResponse.json(
        {
          message: "Invoices updated successfully",
          newTotalAmount,
          oldTotalAmount,
          amountDifference,
          studentsAffected,
        },
        { status: 200 }
      );
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error in invoice update:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
