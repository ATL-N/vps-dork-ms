// import db from "../../../../../lib/db";
// import { NextResponse } from "next/server";

// // /api/finance/viewinvoice/[class_id]/[semester_id]

// export async function GET(req, { params }) {
//   const { class_id, semester_id } = params;
//   try {
//     // const { searchParams } = new URL(req.url);
//     // const class_id = searchParams.get("class_id");
//     // const semester_id = searchParams.get("semester_id");

//     if (!class_id || !semester_id) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const query = `
//       SELECT i.invoice_id, i.description, i.amount, c.class_name, s.semester_name
//       FROM invoices i
//       JOIN invoice_class_semester ics ON i.invoice_id = ics.invoice_id
//       JOIN classes c ON ics.class_id = c.class_id
//       JOIN semesters s ON ics.semester_id = s.semester_id
//       WHERE ics.class_id = $1 AND ics.semester_id = $2
//     `;

//     const result = await db.query(query, [class_id, semester_id]);

//     if (result.rows.length === 0) {
//       return NextResponse.json(
//         { error: "No invoices found for the given class and semester" },
//         { status: 404 }
//       );
//     }

//     const invoiceData = {
//       invoiceNumber: `INV-${class_id}-${semester_id}`,
//       class: result.rows[0].class_name,
//       semester: result.rows[0].semester_name,
//       invoiceItems: result.rows.map((row) => ({
//         description: row.description,
//         amount: parseFloat(row.amount),
//       })),
//       totalAmount: result.rows.reduce(
//         (sum, row) => sum + parseFloat(row.amount),
//         0
//       ),
//       dateIssued: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
//     };

//     return NextResponse.json(invoiceData, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching invoice data:", error);
//     return NextResponse.json(
//       { error: error.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }


import db from "../../../../../lib/db";
import { NextResponse } from "next/server";

// /api/finance/viewinvoice/[class_id]/[semester_id]

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
      SELECT i.invoice_id, i.description, SUM(i.amount) as total_amount, c.class_name, s.semester_name
      FROM invoices i
      JOIN invoice_class_semester ics ON i.invoice_id = ics.invoice_id
      JOIN classes c ON ics.class_id = c.class_id
      JOIN semesters s ON ics.semester_id = s.semester_id
      WHERE ics.class_id = $1 AND ics.semester_id = $2
      GROUP BY i.description, i.invoice_id, c.class_name, s.semester_name
    `;

    const result = await db.query(query, [class_id, semester_id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No invoices found for the given class and semester" },
        { status: 404 }
      );
    }

    const invoiceItems = result.rows.reduce((acc, row) => {
      const existingItem = acc.find(
        (item) => item.description === row.description
      );
      if (existingItem) {
        existingItem.amount += parseFloat(row.total_amount);
      } else {
        acc.push({
          description: row.description,
          amount: parseFloat(row.total_amount),
        });
      }
      return acc;
    }, []);

    const totalAmount = invoiceItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const invoiceData = {
      invoiceNumber: `BIL-${class_id}-${semester_id}`,
      class: result.rows[0].class_name,
      semester: result.rows[0].semester_name,
      invoiceItems: invoiceItems,
      totalAmount: totalAmount,
      dateIssued: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
    };

    return NextResponse.json(invoiceData, { status: 200 });
  } catch (error) {
    console.error("Error fetching invoice data:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}