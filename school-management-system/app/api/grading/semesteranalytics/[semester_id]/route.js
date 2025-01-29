import { NextResponse } from "next/server";
import db from "../../../../lib/db";

// /api/grading/semesteranalytics/[semester_id]/route.js

export async function GET(req, { params }) {
  try {
    const { semester_id } = params;
    if (!semester_id) {
      return NextResponse.json(
        { error: "Semester ID is required" },
        { status: 400 }
      );
    }

    // Fetch overall grade statistics
    const overallStatsQuery = `
      SELECT 
        AVG(total_score) as school_average,
        MAX(total_score) as highest_grade,
        MIN(total_score) as lowest_grade
      FROM student_grades
      WHERE semester_id = $1 AND status = 'active'
    `;
    const overallStatsResult = await db.query(overallStatsQuery, [semester_id]);
    const overallStats = overallStatsResult.rows[0];

    // Fetch grade distribution
    const gradeDistributionQuery = `
      SELECT 
        gs.grade_name as grade,
        COUNT(*) as count
      FROM student_grades sg
      JOIN grading_scheme gs ON sg.gradescheme_id = gs.gradescheme_id
      WHERE sg.semester_id = $1 AND sg.status = 'active'
      GROUP BY gs.grade_name
      ORDER BY gs.grade_name
    `;
    const gradeDistributionResult = await db.query(gradeDistributionQuery, [
      semester_id,
    ]);
    const gradeDistribution = gradeDistributionResult.rows;

    // Fetch subject averages
    const subjectAveragesQuery = `
      SELECT 
        s.subject_name,
        AVG(sg.total_score) as average
      FROM student_grades sg
      JOIN subjects s ON sg.subject_id = s.subject_id
      WHERE sg.semester_id = $1 AND sg.status = 'active'
      GROUP BY s.subject_name
    `;
    const subjectAveragesResult = await db.query(subjectAveragesQuery, [
      semester_id,
    ]);
    const subjectAverages = Object.fromEntries(
      subjectAveragesResult.rows.map((row) => [
        row.subject_name,
        parseFloat(row.average),
      ])
    );

    // Fetch school performance over time
    const performanceOverTimeQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', sg.created_at), 'Mon') as month,
        AVG(sg.total_score) as average_grade
      FROM student_grades sg
      WHERE sg.semester_id = $1 AND sg.status = 'active'
      GROUP BY DATE_TRUNC('month', sg.created_at)
      ORDER BY DATE_TRUNC('month', sg.created_at)
    `;
    const performanceOverTimeResult = await db.query(performanceOverTimeQuery, [
      semester_id,
    ]);
    const schoolPerformanceOverTime = performanceOverTimeResult.rows.map(
      (row) => ({
        month: row.month,
        averageGrade: parseFloat(row.average_grade)?.toFixed(2),
      })
    );

    // Fetch top performing classes (limited to 3)
    const topClassesQuery = `
      SELECT 
        c.class_id,
        c.class_name,
        c.class_level,
        AVG(sg.total_score) as average_grade
      FROM student_grades sg
      JOIN students s ON sg.student_id = s.student_id
      JOIN classes c ON s.class_id = c.class_id
      WHERE sg.semester_id = $1 AND sg.status = 'active'
      GROUP BY c.class_id, c.class_name, c.class_level
      ORDER BY AVG(sg.total_score) DESC
      LIMIT 3
    `;
    const topClassesResult = await db.query(topClassesQuery, [semester_id]);
    const topPerformingClasses = topClassesResult.rows.map((row) => ({
      id: row.class_id,
      name: row.class_name,
      level: row.class_level,
      averageGrade: parseFloat(row.average_grade),
    }));

    // Fetch low performing classes (limited to 3)
    const lowClassesQuery = `
      SELECT 
        c.class_id,
        c.class_name,
        c.class_level,
        AVG(sg.total_score) as average_grade
      FROM student_grades sg
      JOIN students s ON sg.student_id = s.student_id
      JOIN classes c ON s.class_id = c.class_id
      WHERE sg.semester_id = $1 AND sg.status = 'active'
      GROUP BY c.class_id, c.class_name, c.class_level
      ORDER BY AVG(sg.total_score) ASC
      LIMIT 3
    `;
    const lowClassesResult = await db.query(lowClassesQuery, [semester_id]);
    const lowPerformingClasses = lowClassesResult.rows.map((row) => ({
      id: row.class_id,
      name: row.class_name,
      level: row.class_level,
      averageGrade: parseFloat(row.average_grade),
    }));

    // Fetch subject performance for the entire school
    const subjectPerformanceQuery = `
      SELECT 
        s.subject_name as subject,
        AVG(sg.total_score) as school_average,
        MAX(sg.total_score) as top_score,
        MIN(sg.total_score) as low_score
      FROM student_grades sg
      JOIN subjects s ON sg.subject_id = s.subject_id
      WHERE sg.semester_id = $1 AND sg.status = 'active'
      GROUP BY s.subject_name
    `;
    const subjectPerformanceResult = await db.query(subjectPerformanceQuery, [
      semester_id,
    ]);
    const subjectPerformance = subjectPerformanceResult.rows.map((row) => ({
      subject: row.subject,
      schoolAverage: parseFloat(row.school_average),
      topScore: parseFloat(row.top_score),
      lowScore: parseFloat(row.low_score),
    }));

    // Fetch data for classes table
    const classesTableQuery = `
      SELECT 
        c.class_id,
        c.class_name,
        AVG(sg.total_score) as class_average
      FROM student_grades sg
      JOIN students s ON sg.student_id = s.student_id
      JOIN classes c ON s.class_id = c.class_id
      WHERE sg.semester_id = $1 AND sg.status = 'active'
      GROUP BY c.class_id, c.class_name
      ORDER BY c.class_name
    `;
    const classesTableResult = await db.query(classesTableQuery, [semester_id]);
    const classesTableData = classesTableResult.rows.map((row) => ({
      id: row.class_id,
      class_name: row.class_name,
      class_average: parseFloat(row.class_average).toFixed(2),
    }));

    // Fetch grading scheme
    const gradingSchemeQuery = `
      SELECT 
        gradescheme_id,
        grade_name,
        minimum_mark,
        maximum_mark,
        grade_remark
      FROM grading_scheme
      WHERE status = 'active'
      ORDER BY minimum_mark DESC
    `;
    const gradingSchemeResult = await db.query(gradingSchemeQuery);
    const gradingScheme = gradingSchemeResult.rows.map((row) => ({
      id: row.gradescheme_id,
      grade: row.grade_name,
      maxMark: parseFloat(row.maximum_mark),
      minMark: parseFloat(row.minimum_mark),
      remark: row.grade_remark,
    }));

    const gradeAnalytics = {
      schoolAverage: parseFloat(overallStats.school_average) || 0,
      highestGrade: parseFloat(overallStats.highest_grade) || 0,
      lowestGrade: parseFloat(overallStats.lowest_grade) || 0,
      gradeDistribution,
      subjectAverages,
      schoolPerformanceOverTime,
      topPerformingClasses,
      lowPerformingClasses,
      subjectPerformance,
      classesTableData,
      gradingScheme,
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
