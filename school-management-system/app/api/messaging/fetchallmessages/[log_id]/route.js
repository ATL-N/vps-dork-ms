// /api/messaging/fetchallmessages/[log_id]
import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req, { params }) {
  try {
    const { log_id } = params;

    if (!log_id) {
      return NextResponse.json(
        { error: "Missing log_id parameter" },
        { status: 400 }
      );
    }

    const sqlQuery = `
        SELECT 
          id,
          recipient_type,
          message_content,
          total_attempeted,
          total_invalid_numbers,
          total_successful,
          total_failed,
          total_sms_used,
          successful_recipients_ids,
           failed_receipients_ids,
           invalid_recipients_ids,
          TO_CHAR(send_timestamp, 'YYYY-MM-DD HH24:MI:SS') as send_timestamp,
           api_response
        FROM 
          sms_logs
        WHERE 
          id = $1
      `;

    const { rows } = await db.query(sqlQuery, [log_id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "SMS log not found" }, { status: 404 });
    }

    const log = rows[0];
    const {
      recipient_type,
      successful_recipients_ids,
      failed_receipients_ids,
      invalid_recipients_ids,
      invalid_recippients_phone,
    } = log;

    // Function to fetch names and phones
    const fetchDetails = async (ids, type, invalidPhones = []) => {
      if (!ids || ids.length === 0) {
        return [];
      }
      let details = [];
      let sqlQuery = "";
      let params = [ids];
      let phoneColumn = "phone";

      if (type === "suppliers") {
        sqlQuery = `SELECT supplier_id as id, contact_name as name, contact_phone as phone FROM suppliers WHERE supplier_id = ANY($1)`;
        phoneColumn = "contact_phone";
      } else if (type === "parents") {
        sqlQuery = `SELECT user_id as id,  CONCAT(other_names, ' ', last_name) as name, phone FROM parents WHERE user_id = ANY($1)`;
      } else if (type === "staff") {
        sqlQuery = `SELECT user_id as id, CONCAT(first_name, ' ',middle_name,' ', last_name) as name, phone_number as phone FROM staff WHERE user_id = ANY($1)`;
        phoneColumn = "phone_number";
      } else if (type === "users") {
        sqlQuery = `SELECT user_id as id, user_name as name, telephone_number as phone  FROM users WHERE user_id = ANY($1)`;
        phoneColumn = "telephone_number";
      } else if (type === "students" || type === "students owing") {
        sqlQuery = `SELECT user_id as id, CONCAT(first_name, ' ', COALESCE(other_names, ''),' ', last_name) as name, phone FROM students WHERE user_id = ANY($1)`;
      }

      if (sqlQuery) {
        const { rows } = await db.query(sqlQuery, params);
        details = rows.map((row) => ({
          ...row,
        }));
      }
      if (invalidPhones && invalidPhones.length > 0) {
        details.push(
          ...invalidPhones.map((phone) => ({
            name: "Invalid Number",
            phone: phone,
          }))
        );
      }
      return details;
    };

    const [successful, failed, invalid] = await Promise.all([
      fetchDetails(successful_recipients_ids, recipient_type),
      fetchDetails(failed_receipients_ids, recipient_type),
      fetchDetails(
        invalid_recipients_ids,
        recipient_type,
        invalid_recippients_phone
      ),
    ]);

    const response = {
      ...log,
      successful_recipients: successful,
      failed_recipients: failed,
      invalid_recipients: invalid,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
