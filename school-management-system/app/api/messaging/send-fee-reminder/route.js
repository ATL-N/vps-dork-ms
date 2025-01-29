import { NextResponse } from "next/server";
import axios from "axios";
import db from "../../../lib/db";

const isValidPhoneNumber = (phone) => {
  if (!phone) return false;

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("233")) {
    return cleaned.length === 12;
  } else if (cleaned.startsWith("0")) {
    return cleaned.length === 10;
  }

  return cleaned.length === 9;
};

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

  let segments = 0;

  if (!message) {
    return 0;
  }

  const isUnicode = /[^\x00-\x7F]/.test(message);
  const limit = isUnicode ? unicodeLimit : smsLimit;
  segments = Math.ceil(message.length / limit);
  return segments > 0 ? segments : 1;
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, selectedStudentsData, senderId } = body;
    console.log("body: ", body);

    const messagesToSend = [];
    const validRecipients = [];
    const invalidRecipients = [];
    const validRecipientIds = [];
    const invalidRecipientIds = [];
    const smsRequests = [];

    for (const student of selectedStudentsData) {
      const normalizedPhone = normalizePhoneNumber(student.phone);

      if (isValidPhoneNumber(normalizedPhone)) {
        let personalizedMessage = message
          .replace(/\{name\}/g, student.name)
          .replace(/\{amount\}/g, student.amount);

        const smsRequest = {
          sender: process.env.ARKESEL_SENDER_ID || "ATLLocal",
          message: personalizedMessage,
          recipients: [normalizedPhone],
          sandbox: false,
        };

        smsRequests.push(smsRequest);
        messagesToSend.push({
          recipient: normalizedPhone,
          message: personalizedMessage,
        });
        validRecipients.push(normalizedPhone);
        validRecipientIds.push(student.value);
      } else {
        invalidRecipients.push(student.phone);
        invalidRecipientIds.push(student.value);
      }
    }

    let totalAttempted = validRecipients.length;
    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalInvalidNumbers = invalidRecipients.length;
    let successfulRecipientsIds = [];
    let failedRecipientsIds = [];
    let allApiResponses = [];
    let totalSmsUsed = 0;

    if (smsRequests.length > 0) {
      for (const smsRequest of smsRequests) {
        try {
          const response = await axios({
            method: "post",
            url:
              process.env.ARKESEL_URL ||
              "https://sms.arkesel.com/api/v2/sms/send",
            headers: {
              "api-key": process.env.ARKESEL_API_KEY,
            },
            data: smsRequest,
          });

          console.log("Arkesel API Response:", response.data);

          allApiResponses.push({
            recipient: smsRequest.recipients[0],
            response: response.data,
          });

          if (response.data.status === "success") {
            totalSuccessful++;
            const recipientIndex = validRecipients.indexOf(
              smsRequest.recipients[0]
            );
            successfulRecipientsIds.push(validRecipientIds[recipientIndex]);
          } else {
            totalFailed++;
            const recipientIndex = validRecipients.indexOf(
              smsRequest.recipients[0]
            );
            failedRecipientsIds.push(validRecipientIds[recipientIndex]);
          }
        } catch (error) {
          console.error("Individual SMS Send Error:", error);
          totalFailed++;
          const recipientIndex = validRecipients.indexOf(
            smsRequest.recipients[0]
          );
          failedRecipientsIds.push(validRecipientIds[recipientIndex]);

          allApiResponses.push({
            recipient: smsRequest.recipients[0],
            error: error.message || "SMS sending failed",
          });
        }
        totalSmsUsed += calculateSmsSegments(smsRequest.message);
      }
    }

    const insertQuery = `
        INSERT INTO sms_logs (
          recipient_type,
          sender_id,
          recipients_id,
          message_content,
          total_attempeted,
          total_invalid_numbers,
          total_successful,
          total_failed,
          successful_recipients_ids,
          failed_receipients_ids,
          invalid_recipients_ids,
          invalid_recippients_phone,
          api_response,
          message_type,
          total_sms_used
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id;
      `;

    const insertResult = await db.query(insertQuery, [
      "students owing",
      senderId,
      validRecipientIds.concat(invalidRecipientIds),
      message,
      selectedStudentsData?.length,
      totalInvalidNumbers,
      totalSuccessful,
      totalFailed,
      successfulRecipientsIds,
      failedRecipientsIds,
      invalidRecipientIds,
      invalidRecipients,
      JSON.stringify(allApiResponses),
      "fee_reminder",
      totalSmsUsed,
    ]);

    const newSmsLogId = insertResult.rows[0].id;

    // Fetch total SMS sent for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0); // Set to start of the day

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999); // Set to end of the day

    const fetchMonthlySmsQuery = `
          SELECT SUM(total_sms_used) as total_monthly_sms
          FROM sms_logs
          WHERE send_timestamp >= $1 AND send_timestamp <= $2
        `;

    const { rows } = await db.query(fetchMonthlySmsQuery, [
      startOfMonth,
      endOfMonth,
    ]);
    const totalMonthlySms = rows[0]?.total_monthly_sms || 0;

    // Send notification SMS to your personal number
    const notificationMessage = `Monthly SMS Usage: ${totalMonthlySms}. This Month. From ${process.env.NEXT_PUBLIC_SCHOOL_NAME}`;
    const notificationSmsRequest = {
      sender: process.env.ARKESEL_SENDER_ID || "ATLLocal",
      message: notificationMessage,
      recipients: ["233551577446", '0547323204'],
      sandbox: false,
    };

    await axios({
      method: "post",
      url: process.env.ARKESEL_URL || "https://sms.arkesel.com/api/v2/sms/send",
      headers: {
        "api-key": process.env.ARKESEL_API_KEY,
      },
      data: notificationSmsRequest,
    });

    // console.log(`Fee reminder log saved with ID: ${newSmsLogId}`);

    return NextResponse.json({
      message: "Fee reminders sent and logged successfully",
      total: selectedStudentsData?.length,
      successful: totalSuccessful,
      failed: totalFailed,
      invalidNumbers: invalidRecipients,
      smsLogId: newSmsLogId,
    });
  } catch (error) {
    console.error("SMS Sending Error:", error);

    return NextResponse.json(
      {
        error: "Failed to send SMS",
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
