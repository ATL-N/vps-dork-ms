import { NextResponse } from "next/server";
import db from "../../../lib/db";

// GET /api/inventory/getclassstudentsupplies?class_id=1&semester_id=1
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const class_id = searchParams.get("class_id");
    const semester_id = searchParams.get("semester_id");

    console.log("semester_id, class_id", semester_id, class_id);

    if (!class_id || !semester_id) {
      return NextResponse.json(
        { error: "Missing required fields: class_id and semester_id" },
        { status: 400 }
      );
    }

    const sqlQuery = `
      WITH class_items AS (
        SELECT item_id, quantity_per_student
        FROM class_items
        WHERE class_id = $1 AND semester_id = $2 AND status = 'active'
      ),
      student_supplies AS (
        SELECT 
          s.student_id,
          s.last_name  || ' ' || s.first_name || ' ' || s.other_names AS student_name,
          s.amountowed,
          i.item_id,
          i.item_name,
          COALESCE(SUM(is_supply.quantity), 0) AS quantity
        FROM 
          students s
        CROSS JOIN
          class_items ci
        INNER JOIN
          items i ON ci.item_id = i.item_id
        LEFT JOIN
          items_supply is_supply ON s.student_id = is_supply.student_id 
            AND i.item_id = is_supply.item_id 
            AND is_supply.semester_id = $2
            AND is_supply.class_id = $1
        WHERE 
          s.class_id = $1 AND s.status = 'active'
        GROUP BY
          s.student_id, s.first_name, s.last_name, i.item_id, i.item_name
      )
      SELECT 
        student_id,
        student_name,
        amountowed,
        json_agg(
          json_build_object(
            'item_id', item_id,
            'item_name', item_name,
            'quantity', quantity
            
          )
        ) AS supplies
      FROM 
        student_supplies
      GROUP BY
        student_id, student_name, amountowed
      ORDER BY
        student_id
    `;

    const { rows } = await db.query(sqlQuery, [class_id, semester_id]);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "No students or items found for the given class. Contact the admin to assign items to the class",
        },
        { status: 404 }
      );
    }

    const formattedResponse = rows.map((row) => ({
      student_id: row.student_id,
      student_name: row.student_name,
      amountowed: row.amountowed,
      supplies: row.supplies,
    }));

    return NextResponse.json(formattedResponse, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

