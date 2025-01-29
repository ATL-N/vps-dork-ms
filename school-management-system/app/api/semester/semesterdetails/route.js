import db from "../../../lib/db";
import { NextResponse } from "next/server";


// /api/staff/staffdetails

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
          s.*,
          s.staff_id AS id,
          s.first_name || ' ' || s.last_name || ' ' || s.middle_name AS name,
          s.gender,
          TO_CHAR(s.date_of_birth, 'DD/MM/YYYY') AS date_of_birth,
          s.phone_number AS phone,
          s.designation,
          s.department,
          s.role
        FROM
          staff s
        WHERE
          (s.first_name ILIKE $1 OR s.last_name ILIKE $1 OR s.middle_name ILIKE $1 OR 
           s.phone_number ILIKE $1 OR s.email ILIKE $1 OR s.designation ILIKE $1 OR 
           s.department ILIKE $1 OR s.role ILIKE $1) AND s.status = 'active'
        ORDER BY
          s.first_name, s.last_name
        LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete staff list
      sqlQuery = `
        SELECT
          s.*,
          s.staff_id AS id,
          s.first_name || ' ' || s.last_name AS name,
          s.gender,
          TO_CHAR(s.date_of_birth, 'DD/MM/YYYY') AS date_of_birth,
          s.phone_number AS phone,
          s.designation,
          s.department,
          s.role
        FROM
          staff s
        WHERE
          s.status = 'active'
        ORDER BY
          s.first_name, s.last_name
        LIMIT 10000
      `;
    }

    const { rows } = await db.query(sqlQuery, queryParams);

    // Fetch overall staff statistics
    const statsQuery = `
      SELECT
        COUNT(*) AS total_count,
        COUNT(*) FILTER (WHERE gender = 'M') AS male_count,
        COUNT(*) FILTER (WHERE gender = 'F') AS female_count,
        SUM(salary) AS total_salary,
        COUNT(*) FILTER (WHERE role = 'teaching staff') AS teaching_staff_count,
        COUNT(*) FILTER (WHERE role != 'teaching staff') AS non_teaching_staff_count
      FROM
        staff
      WHERE
        status = 'active'
    `;
    const statsResult = await db.query(statsQuery);
    const stats = statsResult.rows[0];

    // Fetch staff count per department
    const departmentStatsQuery = `
      SELECT
        department,
        COUNT(*) AS staff_count
      FROM
        staff
      WHERE
        status = 'active'
      GROUP BY
        department
      ORDER BY
        staff_count DESC
    `;
    const departmentStatsResult = await db.query(departmentStatsQuery);
    const departmentStats = departmentStatsResult.rows;

    // Combine staff list and statistics
    const responseData = {
      staff: rows,
      stats: {
        ...stats,
        departmentBreakdown: departmentStats,
      },
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

