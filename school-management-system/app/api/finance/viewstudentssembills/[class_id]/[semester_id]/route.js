import db from "../../../../../lib/db";
import { NextResponse } from "next/server";

// /api/finance/viewstudentssembills/[class_id]/[semester_id]
// /api/finance/viewstudentssembills/

export async function GET(req, { params }) {
  const { class_id, semester_id } = params;

  try {
    if (!class_id || !semester_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const query = `
      SELECT s.student_id, s.first_name, s.last_name, s.amountowed,
             i.invoice_id, i.description, SUM(i.amount) as total_amount, 
             c.class_name, sem.semester_name
      FROM students s
      LEFT JOIN invoice_class_semester ics ON s.class_promoted_to = ics.class_id
      LEFT JOIN invoices i ON ics.invoice_id = i.invoice_id
      JOIN classes c ON s.class_promoted_to = c.class_id
      JOIN semesters sem ON ics.semester_id = sem.semester_id
      WHERE s.class_promoted_to = $1 AND ics.semester_id = $2
      GROUP BY i.description, s.student_id, i.invoice_id,  c.class_name, sem.semester_name
    `;

    const result = await db.query(query, [class_id, semester_id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "No students or invoices found for the given class and semester",
        },
        { status: 404 }
      );
    }

    const studentInvoices = result.rows.reduce((acc, row) => {
      if (!acc[row.student_id]) {
        acc[row.student_id] = {
          studentId: row.student_id,
          firstName: row.first_name,
          lastName: row.last_name,
          amountOwed: parseFloat(row.amountowed),
          invoiceItems: [],
          totalAmount: 0,
        };
      }

      if (row.invoice_id) {
        const amount = parseFloat(row.total_amount);
        acc[row.student_id].invoiceItems.push({
          description: row.description,
          amount: amount,
        });
        acc[row.student_id].totalAmount += amount;
      }

      return acc;
    }, {});

    const invoiceData = Object.values(studentInvoices).map((student) => {
      console.log('student.totalAmount', student.totalAmount);
      const arrears = student.amountOwed - student.totalAmount;
            console.log("student.totalAmount + arrears", student.totalAmount+arrears);

      return {
        id: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        invoiceNumber: `BIL-${student.studentId}-${class_id}-${semester_id}`,
        class: result.rows[0].class_name,
        semester: result.rows[0].semester_name,
        invoiceItems: [
          ...student.invoiceItems,
          { description: "Arrears", amount: arrears },
        ],
        totalAmountOwed: student.amountOwed,
        dateIssued: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
      };
    });

    return NextResponse.json(invoiceData, { status: 200 });
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
