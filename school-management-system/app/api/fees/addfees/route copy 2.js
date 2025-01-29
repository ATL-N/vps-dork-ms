import { NextResponse } from "next/server";
import db from "../../../lib/db";
import axios from "axios";

const normalizePhoneNumber = (phone) => {
  if (!phone) return "";

  let normalized = phone.replace(/\D/g, "");

  if (normalized.length < 9) {
    return "";
  }

  if (normalized.startsWith("0")) {
    normalized = "233" + normalized.slice(1);
  } else if (normalized.length === 9) {
    normalized = "233" + normalized;
  } else if (!normalized.startsWith("233")) {
    return "";
  }

  if (normalized.length !== 12) {
    return "";
  }

  return normalized;
};

const calculateSmsSegments = (message) => {
  const smsLimit = 160;
  const unicodeLimit = 70;

  if (!message) {
    return 0;
  }

  const isUnicode = /[^\x00-\x7F]/.test(message);
  const limit = isUnicode ? unicodeLimit : smsLimit;
  return Math.ceil(message.length / limit) || 1;
};

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
      sendSMS,
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

    // Fetch the current balance
    const balanceQuery =
      "SELECT amountowed FROM students WHERE student_id = $1";
    const balanceResult = await db.query(balanceQuery, [student_id]);
    const old_balance = parseFloat(balanceResult.rows[0].amountowed);

    // Insert into fee_collections
    const insertFeeCollectionQuery = `
      INSERT INTO fee_collections (
        student_id, payment_date, amount_received, old_balance, 
        new_balance, fee_type, payment_mode, received_by, comment
      )
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

    // Update students table
    const updateStudentQuery = `UPDATE students SET amountowed = $1 WHERE student_id = $2;`;
    await db.query(updateStudentQuery, [new_balance, student_id]);

    // Send SMS if requested
    if (sendSMS && phone) {
      const normalizedPhone = normalizePhoneNumber(phone);

      if (normalizedPhone) {
        const smsMessage = `Payment Received: GHS ${amount_received} for ${student.first_name} ${student.last_name}. New balance: GHS ${new_balance}. Receipt #: ${collection_id}. Thank you!`;

        const smsData = {
          sender: process.env.ARKESEL_SENDER_ID,
          message: smsMessage,
          recipients: [normalizedPhone],
          sandbox: false,
        };

        try {
          await axios({
            method: "post",
            url: process.env.ARKESEL_URL,
            headers: {
              "api-key": process.env.ARKESEL_API_KEY,
            },
            data: smsData,
          });

          // Log SMS in database
          const insertSmsQuery = `
            INSERT INTO sms_logs (
              recipient_type, sender_id, recipients_id, message_content,
              total_attempeted, total_successful, message_type, total_sms_used
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `;

          const messageSegments = calculateSmsSegments(smsMessage);

          await db.query(insertSmsQuery, [
            "fee_payment",
            received_by,
            [student_id],
            smsMessage,
            1,
            1,
            "fee_payment",
            messageSegments,
          ]);
        } catch (smsError) {
          console.error("SMS sending failed:", smsError);
        }

        // Send monthly report SMS
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        const monthlyQuery = `
        SELECT 
          SUM(amount_received) as total_amount,
          COUNT(*) as total_transactions
        FROM fee_collections 
        WHERE payment_date >= $1 AND payment_date <= $2
      `;

        const monthlyResult = await db.query(monthlyQuery, [
          startOfMonth,
          endOfMonth,
        ]);
        const monthlyStats = monthlyResult.rows[0];

        const notificationMessage = `Monthly Fee Collections: GHS ${
          monthlyStats.total_amount || 0
        }. Total Transactions: ${monthlyStats.total_transactions || 0}`;

        const notificationSmsRequest = {
          sender: process.env.ARKESEL_SENDER_ID,
          message: notificationMessage,
          recipients: ["233551577446", "0547323204"],
          sandbox: false,
        };

        try {
          await axios({
            method: "post",
            url: process.env.ARKESEL_URL,
            headers: {
              "api-key": process.env.ARKESEL_API_KEY,
            },
            data: notificationSmsRequest,
          });
        } catch (monthlyError) {
          console.error("Monthly report SMS failed:", monthlyError);
        }
      }
    }

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
