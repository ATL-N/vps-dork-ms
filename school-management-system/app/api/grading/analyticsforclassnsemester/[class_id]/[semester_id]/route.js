import { NextResponse } from "next/server";
import db from "../../../../../lib/db";

export async function GET(req, { params }) {
  try {
    const { class_id, semester_id } = params;
    if (!semester_id || !class_id) {
      return NextResponse.json(
        { error: "Semester ID and Class ID are required" },
        { status: 400 }
      );
    }

    // Fetch class details
    const classQuery = `
      SELECT class_name, class_level
      FROM classes
      WHERE class_id = $1 AND status = 'active'
    `;
    const classResult = await db.query(classQuery, [class_id]);
    if (classResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Class not found or not active" },
        { status: 404 }
      );
    }
    const classDetails = classResult.rows[0];

    // Overall stats query using student_grades class_id
    const overallStatsQuery = `
      SELECT 
        AVG(total_score) as class_average,
        MAX(total_score) as highest_grade,
        MIN(total_score) as lowest_grade
      FROM student_grades sg
      WHERE sg.semester_id = $1 
        AND sg.class_id = $2 
        AND sg.status = 'active'
    `;
    const overallStatsResult = await db.query(overallStatsQuery, [
      semester_id,
      class_id,
    ]);
    const overallStats = overallStatsResult.rows[0];

    // Grade distribution query
    const gradeDistributionQuery = `
      WITH grade_counts AS (
        SELECT 
          gs.grade_name as grade,
          COUNT(*) as count
        FROM student_grades sg
        JOIN grading_scheme gs ON sg.gradescheme_id = gs.gradescheme_id
        WHERE sg.semester_id = $1 
          AND sg.class_id = $2 
          AND sg.status = 'active'
        GROUP BY gs.grade_name
      ),
      total_students AS (
        SELECT SUM(count) as total
        FROM grade_counts
      )
      SELECT 
        gc.grade,
        gc.count,
        ROUND(CAST((gc.count::float / ts.total::float) * 100 AS numeric), 2) as percentage
      FROM grade_counts gc, total_students ts
      ORDER BY gc.grade
    `;
    const gradeDistributionResult = await db.query(gradeDistributionQuery, [
      semester_id,
      class_id,
    ]);
    const gradeDistribution = gradeDistributionResult.rows.map((row) => ({
      grade: row.grade,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage),
    }));

    // Subject averages query
    const subjectAveragesQuery = `
      SELECT 
        s.subject_name,
        AVG(sg.total_score) as average
      FROM student_grades sg
      JOIN subjects s ON sg.subject_id = s.subject_id
      WHERE sg.semester_id = $1 
        AND sg.class_id = $2 
        AND sg.status = 'active'
      GROUP BY s.subject_name
    `;
    const subjectAveragesResult = await db.query(subjectAveragesQuery, [
      semester_id,
      class_id,
    ]);
    const subjectAverages = Object.fromEntries(
      subjectAveragesResult.rows.map((row) => [
        row.subject_name,
        parseFloat(row.average),
      ])
    );

    // Performance over time query
    const performanceOverTimeQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', sg.created_at), 'Mon') as month,
        AVG(sg.total_score) as average_grade
      FROM student_grades sg
      WHERE sg.semester_id = $1 
        AND sg.class_id = $2 
        AND sg.status = 'active'
      GROUP BY DATE_TRUNC('month', sg.created_at)
      ORDER BY DATE_TRUNC('month', sg.created_at)
    `;
    const performanceOverTimeResult = await db.query(performanceOverTimeQuery, [
      semester_id,
      class_id,
    ]);
    const studentPerformanceOverTime = performanceOverTimeResult.rows.map(
      (row) => ({
        month: row.month,
        averageGrade: parseFloat(row.average_grade),
      })
    );

    // Top performers query
    const topPerformersQuery = `
      SELECT 
        s.student_id as id,
        CONCAT(s.first_name, ' ', s.last_name) as name,
        AVG(sg.total_score) as average_grade
      FROM student_grades sg
      JOIN students s ON sg.student_id = s.student_id
      WHERE sg.semester_id = $1 
        AND sg.class_id = $2 
        AND sg.status = 'active'
      GROUP BY s.student_id, s.first_name, s.last_name
      ORDER BY AVG(sg.total_score) DESC
      LIMIT 3
    `;
    const topPerformersResult = await db.query(topPerformersQuery, [
      semester_id,
      class_id,
    ]);
    const topPerformers = topPerformersResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      averageGrade: parseFloat(row.average_grade),
    }));

    // Low performers query
    const lowPerformersQuery = `
      SELECT 
        s.student_id as id,
        CONCAT(s.first_name, ' ', s.last_name) as name,
        AVG(sg.total_score) as average_grade
      FROM student_grades sg
      JOIN students s ON sg.student_id = s.student_id
      WHERE sg.semester_id = $1 
        AND sg.class_id = $2 
        AND sg.status = 'active'
      GROUP BY s.student_id, s.first_name, s.last_name
      ORDER BY AVG(sg.total_score) ASC
      LIMIT 3
    `;
    const lowPerformersResult = await db.query(lowPerformersQuery, [
      semester_id,
      class_id,
    ]);
    const lowPerformers = lowPerformersResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      averageGrade: parseFloat(row.average_grade),
    }));

    // Subject performance query
    const subjectPerformanceQuery = `
      SELECT 
        s.subject_name as subject,
        AVG(sg.total_score) as class_average,
        MAX(sg.total_score) as top_student_score,
        MIN(sg.total_score) as low_student_score
      FROM student_grades sg
      JOIN subjects s ON sg.subject_id = s.subject_id
      WHERE sg.semester_id = $1 
        AND sg.class_id = $2 
        AND sg.status = 'active'
      GROUP BY s.subject_name
    `;
    const subjectPerformanceResult = await db.query(subjectPerformanceQuery, [
      semester_id,
      class_id,
    ]);
    const subjectPerformance = subjectPerformanceResult.rows.map((row) => ({
      subject: row.subject,
      classAverage: parseFloat(row.class_average),
      topStudentScore: parseFloat(row.top_student_score),
      lowStudentScore: parseFloat(row.low_student_score),
    }));

    const gradeAnalytics = {
      className: classDetails.class_name,
      classLevel: classDetails.class_level,
      classAverage: parseFloat(overallStats.class_average) || 0,
      highestGrade: parseFloat(overallStats.highest_grade) || 0,
      lowestGrade: parseFloat(overallStats.lowest_grade) || 0,
      gradeDistribution,
      subjectAverages,
      studentPerformanceOverTime,
      topPerformers,
      lowPerformers,
      subjectPerformance,
    };

    return NextResponse.json({ gradeAnalytics }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
