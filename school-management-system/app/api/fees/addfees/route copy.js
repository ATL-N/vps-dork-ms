import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function POST(req) {
  try {
    await db.query("BEGIN");

    const body = await req.json();
    console.log("fees body", body);
    const {
      student_id,
      payment_date,
      amount_received,
      fee_type,
      payment_mode,
      received_by,
      new_balance,
      comments,
      phone,
      sendSMS, //boolean value(true / false)
    } = body;

    if (!payment_date || !amount_received) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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


    // Fetch the current balance for the student
    const balanceQuery =
      "SELECT amountowed FROM students WHERE student_id = $1";
    const balanceResult = await db.query(balanceQuery, [student_id]);
    const old_balance = parseFloat(balanceResult.rows[0].amountowed);

    // Calculate the new balance
    // const new_balance = Math.max(0, old_balance - parseFloat(amount_received));

    // Insert into fee_collections table
    const insertFeeCollectionQuery = `
      INSERT INTO fee_collections
      (student_id, payment_date, amount_received, old_balance, new_balance, fee_type, payment_mode, received_by, comment)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING collection_id;
    `;
    const feeCollectionResult = await db.query(insertFeeCollectionQuery, [
      student_id,
      payment_date,
      amount_received,
      old_balance,
      new_balance,
      fee_type,
      payment_mode,
      received_by,
      comments,
    ]);
    const collection_id = feeCollectionResult.rows[0].collection_id;

    // Update the students table with the new balance
    const updateStudentQuery = `
      UPDATE students
      SET amountowed = $1
      WHERE student_id = $2;
    `;
    await db.query(updateStudentQuery, [new_balance, student_id]);

    // Commit the transaction
    await db.query("COMMIT");

    return NextResponse.json(
      {
        message: "Fee collection recorded successfully.",
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
      { status: 201 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to record fee collection" },
      { status: 500 }
    );
  }
}


// import { NextResponse } from "next/server";
// import db from "../../../lib/db";

// export async function POST(req) {
//   try {
//     await db.query("BEGIN");

//     const body = await req.json();
//     console.log('body', body)
//     const {
//       student_id,
//       payment_date,
//       amount_received,
//       fee_type,
//       payment_mode,
//       received_by,
//       new_balance,
//       comments,
//     } = body;

//     if (!payment_date || !amount_received) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }
//     // Fetch the current balance for the student
//     const balanceQuery =
//       "SELECT amountowed FROM students WHERE student_id = $1";
//     const balanceResult = await db.query(balanceQuery, [student_id]);
//     const old_balance = parseFloat(balanceResult.rows[0].amountowed);

//     // Calculate the new balance
//     // const new_balance = Math.max(0, old_balance - parseFloat(amount_received));

//     // Insert into fee_collections table
//     const insertFeeCollectionQuery = `
//       INSERT INTO fee_collections
//       (student_id, payment_date, amount_received, old_balance, new_balance, fee_type, payment_mode, received_by, comment)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//       RETURNING collection_id`;
//     ;
//     const feeCollectionResult = await db.query(insertFeeCollectionQuery, [
//       student_id,
//       payment_date,
//       amount_received,
//       old_balance,
//       new_balance,
//       fee_type,
//       payment_mode,
//       received_by,
//       comments,
//     ]);
//     const collection_id = feeCollectionResult.rows[0].collection_id;

//     // Update the students table with the new balance
//     const updateStudentQuery = `
//       UPDATE students
//       SET amountowed = $1
//       WHERE student_id = $2`;
//     ;
//     await db.query(updateStudentQuery, [new_balance, student_id]);

//     // Commit the transaction
//     await db.query("COMMIT");

//     return NextResponse.json(
//       {
//         message: "Fee collection recorded successfully.",
//         collection_id: collection_id,
//         new_balance: new_balance,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     await db.query("ROLLBACK");
//     console.error("Database error:", error);
//     return NextResponse.json(
//       { error: "Failed to record fee collection" },
//       { status: 500 }
//     );
//   }
// }