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
    const { message, recipients, recipientType, recipientIds, senderId } = body;

    // Separate valid and invalid recipients
    const validRecipients = [];
    const invalidRecipients = [];
    const validRecipientIds = [];
    const invalidRecipientIds = [];

    for (let i = 0; i < recipients.length; i++) {
      if (isValidPhoneNumber(recipients[i])) {
        validRecipients.push(normalizePhoneNumber(recipients[i]));
        validRecipientIds.push(recipientIds[i]);
      } else {
        invalidRecipients.push(recipients[i]);
        invalidRecipientIds.push(recipientIds[i]);
      }
    }

    const data = {
      sender: process.env.ARKESEL_SENDER_ID,
      message: message,
      recipients: validRecipients,
      sandbox: false,
    };

    // console.log("Sending SMS with data:", data);

    let totalAttempted = validRecipients.length;
    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalInvalidNumbers = invalidRecipients.length;
    let successfulRecipientsIds = [];
    let failedRecipientsIds = [];
    let arkeselResponse = {};
    let totalSmsUsed = 0;

    const messageSegments = calculateSmsSegments(message);

    if (validRecipients.length > 0) {
      // Send SMS via Arkesel
      const response = await axios({
        method: "post",
        url: process.env.ARKESEL_URL,
        headers: {
          "api-key": process.env.ARKESEL_API_KEY,
        },
        data: data,
      });

      console.log("Arkesel API Response:", response.data);
      arkeselResponse = response.data;

      // Extract relevant information from the Arkesel response
      const arkeselSuccessfulRecipients = arkeselResponse.data.filter(
        (item) => item.recipient && item.id
      );
      const arkeselFailedRecipients = arkeselResponse.data.filter(
        (item) => !item.recipient || !item.id
      );
      totalSuccessful = arkeselSuccessfulRecipients.length;
      totalFailed = arkeselFailedRecipients.length;

      // Map successful Arkesel responses back to validRecipientIds using normalized phone number as the key
      successfulRecipientsIds = arkeselSuccessfulRecipients.map(
        (arkeselItem) => {
          const normalizedArkeselRecipient = normalizePhoneNumber(
            arkeselItem.recipient
          );
          const recipientIndex = validRecipients.indexOf(
            normalizedArkeselRecipient
          );
          return validRecipientIds[recipientIndex];
        }
      );
      console.log("successfulRecipientsIds:", successfulRecipientsIds);

      // Map failed Arkesel responses back to validRecipientIds using normalized phone number as the key
      failedRecipientsIds = validRecipientIds.filter((id, index) => {
        const normalizedPhone = validRecipients[index];
        return !arkeselSuccessfulRecipients.some(
          (item) => normalizePhoneNumber(item.recipient) === normalizedPhone
        );
      });
      totalSmsUsed = messageSegments * validRecipients.length;
      console.log("failedRecipientsIds:", failedRecipientsIds);
    }

    // Save to database as bulk SMS
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
      recipientType,
      senderId,
      [...validRecipientIds, ...invalidRecipientIds],
      message,
      recipients?.length,
      totalInvalidNumbers,
      totalSuccessful,
      totalFailed,
      successfulRecipientsIds,
      failedRecipientsIds,
      invalidRecipientIds,
      invalidRecipients,
      arkeselResponse,
      "general",
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
          SELECT SUM(total_sms_used) as total_monthly_sms,
                 SUM(total_invalid_numbers) as total_monthly_invalid,
                 SUM(total_successful) as total_monthly_successful,
                 SUM(total_attempeted) as total_monthly_recipients
          FROM sms_logs
          WHERE send_timestamp >= $1 AND send_timestamp <= $2
        `;

    const { rows } = await db.query(fetchMonthlySmsQuery, [
      startOfMonth,
      endOfMonth,
    ]);
    const totalMonthlySms = rows[0]?.total_monthly_sms || 0;
    const totalMonthlyInvalid = rows[0]?.total_monthly_invalid || 0;
    const totalMonthlySuccessful = rows[0]?.total_monthly_successful || 0;
    const totalMonthlyRecipients = rows[0]?.total_monthly_recipients || 0;

    // Send notification SMS to your personal number
    const notificationMessage = `Monthly SMS Usage: ${totalMonthlySms}. This Month`;
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

    console.log(`SMS log saved with ID: ${newSmsLogId}`);

    return NextResponse.json({
      message: "Message sent and logged successfully",
      total: recipients?.length,
      successful: totalSuccessful,
      failed: totalFailed,
      invalidNumbers: invalidRecipients,
      smsLogId: newSmsLogId,
      totalMonthlySms,
      totalMonthlyInvalid,
      totalMonthlySuccessful,
      totalMonthlyRecipients,
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
