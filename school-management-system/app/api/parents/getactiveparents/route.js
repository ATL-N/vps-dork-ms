import db from "../../../lib/db";
import { NextResponse } from "next/server";

// /api/parents/getparents
// /api/parents/getactiveparents
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
        WITH student_counts AS (
          SELECT 
            sp.parent_id,
            COUNT(DISTINCT s.student_id) as active_students_count
          FROM 
            student_parent sp
          JOIN 
            students s ON sp.student_id = s.student_id
          WHERE 
            s.status = 'active'
          GROUP BY 
            sp.parent_id
        )
        SELECT 
          p.parent_id AS id,
          p.last_name || ' ' || p.other_names  AS name,
          p.phone,
          COALESCE(sc.active_students_count, 0) as active_students_count
        FROM 
          parents p
        LEFT JOIN 
          student_counts sc ON p.parent_id = sc.parent_id
        LEFT JOIN 
          student_parent sp ON p.parent_id = sp.parent_id
        LEFT JOIN 
          students s ON sp.student_id = s.student_id AND s.status = 'active'
        LEFT JOIN 
          classes c ON s.class_id = c.class_id
        WHERE 
          (p.other_names ILIKE $1 OR 
          p.last_name ILIKE $1 OR 
          p.phone ILIKE $1 OR 
          p.email ILIKE $1) AND p.status='active'
        GROUP BY 
          p.parent_id,
          p.other_names,
          p.last_name,
          p.phone,
          p.email,
          p.address,
          sc.active_students_count
        ORDER BY 
          p.last_name, p.other_names
        LIMIT 10000
      `;
      queryParams = [sanitizedQuery];
    } else {
      // Complete parents list
      sqlQuery = `
        WITH student_counts AS (
          SELECT 
            sp.parent_id,
            COUNT(DISTINCT s.student_id) as active_students_count
          FROM 
            student_parent sp
          JOIN 
            students s ON sp.student_id = s.student_id
          WHERE 
            s.status = 'active'
          GROUP BY 
            sp.parent_id
        )
        SELECT 
          p.parent_id AS id,
          p.last_name  || ' ' || p.other_names AS name,
          p.phone,
          COALESCE(sc.active_students_count, 0) as active_students_count
        FROM 
          parents p
        LEFT JOIN 
          student_counts sc ON p.parent_id = sc.parent_id
        LEFT JOIN 
          student_parent sp ON p.parent_id = sp.parent_id
        LEFT JOIN 
          students s ON sp.student_id = s.student_id AND s.status = 'active'
        LEFT JOIN 
          classes c ON s.class_id = c.class_id
        WHERE 
            p.status = 'active'
        GROUP BY 
          p.parent_id,
          p.other_names,
          p.last_name,
          p.phone,
          p.email,
          p.address,
          sc.active_students_count
        ORDER BY 
          p.last_name, p.other_names
        LIMIT 10000
      `;
    }

    const { rows } = await db.query(sqlQuery, queryParams);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
