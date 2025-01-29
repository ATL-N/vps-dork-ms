import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const query = `
      WITH class_count AS (
        SELECT 
          c.class_name,
          COUNT(s.student_id) AS students
        FROM 
          classes c
        LEFT JOIN 
          students s ON c.class_id = s.class_id AND s.status = 'active'
        GROUP BY 
          c.class_name
      ),
      total_counts AS (
        SELECT 
          COUNT(DISTINCT s.student_id) AS total_students,
          (SELECT COUNT(*) FROM staff WHERE status = 'active') AS total_staff,
          (SELECT COUNT(*) FROM parents WHERE status = 'active') AS total_parents,
          (SELECT COUNT(*) FROM users WHERE status = 'active') AS total_users
        FROM 
          students s
        WHERE 
          s.status = 'active' AND s.class_id != 1
      )
      SELECT 
        class_count.*,
        total_counts.*
      FROM 
        class_count,
        total_counts
      ORDER BY 
        class_count.class_name
    `;

    const result = await db.query(query);

    if (result.rows.length > 0) {
      const { total_students, total_staff, total_users, total_parents } = result.rows[0];
      const gradeData = result.rows.map((row) => ({
        class_name: row.class_name,
        students: parseInt(row.students),
      }));

      const formattedData = {
        gradeDistribution: gradeData,
        totalStudents: parseInt(total_students),
        totalStaff: parseInt(total_staff),
        totalParents: parseInt(total_parents),
        // totalUsers: parseInt(total_users),
        totalUsers:
          parseInt(total_students || 0) +
          parseInt(total_staff || 0) +
          parseInt(total_parents || 0),
      };

      return NextResponse.json(formattedData, { status: 200 });
    } else {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching school statistics:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

