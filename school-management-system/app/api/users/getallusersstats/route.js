import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/users/getallusersstats/route.js

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
          user_id::integer AS id,
          user_name,
          user_email,
          role,
          status
        FROM
          users
        WHERE
          (user_name ILIKE $1 OR user_email ILIKE $1 OR role ILIKE $1) AND status='active'
        ORDER BY
          role,user_name
        LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete user list
      sqlQuery = `
        SELECT
          user_id::integer AS id,
          user_name,
          user_email,
          role,
          status
        FROM
          users
        WHERE 
          status='active'
        ORDER BY
          role, user_name
        LIMIT 10000
      `;
    }

    const { rows: data } = await db.query(sqlQuery, queryParams);

    // Fetch user statistics
    const statsQuery = `
      SELECT
        role AS name,
        COUNT(*)::integer AS count
      FROM
        users
      WHERE 
        status='active'
      GROUP BY
        role
    `;
    const { rows: stats } = await db.query(statsQuery);

    // Get total number of users
    const totalQuery = `SELECT COUNT(*)::integer AS total FROM users WHERE status='active'`;
    const { rows: totalResult } = await db.query(totalQuery);
    const total = totalResult[0].total;

    // Fetch students statistics
    const statsQuery2 = `
      SELECT
        COUNT(*)::integer AS studentscount
      FROM
        students
      WHERE 
        status='active'
    `;
    const { rows: stats2 } = await db.query(statsQuery2);
    const studentstotal = stats2[0].studentscount;

    const parentsquery = `
      SELECT
        COUNT(*)::integer AS parentscount
      FROM
        parents
      WHERE 
        status='active'
    `;
    const { rows: totalparents } = await db.query(parentsquery);
    const totalparentcount = totalparents[0].parentscount;

    const staffquery = `
      SELECT
        COUNT(*)::integer AS staffcount
      FROM
        staff
      WHERE 
        status='active'
    `;
    const { rows: totalstaff } = await db.query(staffquery);
    const totalstaffcount = totalstaff[0].staffcount;

    return NextResponse.json(
      {
        data,
        stats,
        total,
        studentstotal,
        totalparentcount,
        totalstaffcount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

