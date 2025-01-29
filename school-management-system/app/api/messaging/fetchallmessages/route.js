import { NextResponse } from "next/server";
import db from "../../../lib/db";


// /api/messaging/fetchallmessages/route.js
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    let sqlQuery;
    let queryParams = [];

    if (query) {
      // Search functionality
      const sanitizedQuery = `%${query}%`;
      sqlQuery = `
        SELECT 
          id,
          recipient_type,
          message_content,
          total_attempeted,
          total_invalid_numbers,
          total_successful,
          total_failed,
          total_sms_used,
          TO_CHAR(send_timestamp, 'YYYY-MM-DD HH24:MI:SS') as send_timestamp
        FROM 
          sms_logs
        WHERE 
          (message_content ILIKE $1 OR recipient_type ILIKE $1)
        ORDER BY 
          send_timestamp DESC
        LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete SMS logs list
      sqlQuery = `
        SELECT 
          id,
          recipient_type,
          message_content,
          total_attempeted,
          total_invalid_numbers,
          total_successful,
          total_failed,
          total_sms_used,
          TO_CHAR(send_timestamp, 'YYYY-MM-DD HH24:MI:SS') as send_timestamp
        FROM 
          sms_logs
        ORDER BY 
          send_timestamp DESC
        LIMIT 10000
      `;
    }

    const { rows } = await db.query(sqlQuery, queryParams);

    // Calculate totals
    const totalSmsSent = rows.reduce(
      (sum, log) => sum + (log.total_sms_used || 0),
      0
    );
    const totalInvalidNumbers = rows.reduce(
      (sum, log) => sum + (log.total_invalid_numbers || 0),
      0
    );
    const totalSuccessfulMessages = rows.reduce(
      (sum, log) => sum + (log.total_successful || 0),
      0
    );
    const totalRecipients = rows.reduce(
      (sum, log) => sum + (log.total_attempeted || 0),
      0
    );

    const responseData = {
      logs: rows,
      totalSmsSent,
      totalInvalidNumbers,
      totalSuccessfulMessages,
      totalRecipients,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
