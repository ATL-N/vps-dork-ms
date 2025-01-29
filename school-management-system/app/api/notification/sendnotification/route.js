import db from "../../../lib/db";
import { NextResponse } from "next/server";

const RECIPIENT_TYPES = {
  ALL_USERS: "all users",
  STAFF: "staff",
  STUDENTS: "students",
  PARENTS: "parents",
};

const getRecipientQuery = (recipientType) => {
  const queries = {
    [RECIPIENT_TYPES.ALL_USERS]: `SELECT user_id as recipient_id FROM users WHERE status = 'active'`,
    [RECIPIENT_TYPES.STAFF]: `SELECT staff_id as recipient_id FROM staff WHERE status = 'active'`,
    [RECIPIENT_TYPES.STUDENTS]: `SELECT student_id as recipient_id FROM students WHERE status = 'active'`,
    [RECIPIENT_TYPES.PARENTS]: `SELECT parent_id as recipient_id FROM parents WHERE status = 'active'`,
  };
  return queries[recipientType] || null;
};

const insertNotification = async (db, notificationData) => {
  const {
    notification_title,
    notification_message,
    notification_type,
    priority,
    sender_id,
  } = notificationData;
  const query = `
    INSERT INTO notifications (notification_title, notification_message, notification_type, priority, sender_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING notification_id, notification_title;
  `;
  const result = await db.query(query, [
    notification_title,
    notification_message,
    notification_type,
    priority,
    sender_id,
  ]);
  return result.rows[0];
};

const linkNotificationToRecipients = async (
  db,
  notificationId,
  recipientIds,
  recipientType
) => {
  const query = `
    INSERT INTO notification_recipients (notification_id, recipient_id, recipient_type)
    SELECT $1, unnest($2::int[]), $3
    RETURNING notification_id;
  `;
  return db.query(query, [notificationId, recipientIds, recipientType]);
};

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('body', body)
    const {
      notification_title,
      notification_message,
      notification_type,
      priority,
      sender_id,
      recipient_type,
    } = body;

    if (
      !notification_title ||
      !notification_message ||
      !notification_type ||
      !sender_id
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await db.query("BEGIN");

    const recipientQuery = getRecipientQuery(recipient_type);
    if (!recipientQuery) {
      throw new Error(`Invalid recipient type: ${recipient_type}`);
    }

    const recipientResult = await db.query(recipientQuery);
    const recipients = recipientResult.rows;

    const { notification_id } = await insertNotification(db, body);

    const recipientIds = recipients.map((item) => item.recipient_id);
    await linkNotificationToRecipients(
      db,
      notification_id,
      recipientIds,
      recipient_type
    );

    await db.query("COMMIT");

    console.log(`Notification ${notification_id} added successfully`);
    return NextResponse.json(
      {
        message: `Notification (${notification_id}) added successfully`,
        id: notification_id,
      },
      { status: 201 }
    );
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error in POST /api/notification/sendnotification:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
