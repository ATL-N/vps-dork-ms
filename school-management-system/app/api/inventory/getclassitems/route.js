import { NextResponse } from "next/server";
import db from "../../../lib/db";

// GET /api/inventory/getclassitems?class_id=1&semester_id=1
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const class_id = searchParams.get("class_id");
    const semester_id = searchParams.get("semester_id");

    if (!class_id || !semester_id) {
      return NextResponse.json(
        { error: "Missing required fields: class_id and semester_id" },
        { status: 400 }
      );
    }

    const sqlQuery = `
      SELECT 
        i.item_id,
        i.item_name,
        i.category,
        i.description,
        i.unit_price,
        ci.quantity_per_student,
        s.first_name || ' ' || s.last_name AS supplied_by,
        ci.assigned_at
      FROM 
        class_items ci
      INNER JOIN 
        items i ON ci.item_id = i.item_id
      INNER JOIN 
        staff s ON ci.supplied_by = s.user_id
      WHERE 
        ci.class_id = $1 
        AND ci.semester_id = $2 
        AND ci.status = 'active'
    `;

    const { rows } = await db.query(sqlQuery, [class_id, semester_id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No items found for the given class and semester" },
        { status: 404 }
      );
    }

    const formattedResponse = {
      class_id: parseInt(class_id),
      semester_id: parseInt(semester_id),
      items: rows.map((item) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        category: item.category,
        description: item.description,
        unit_price: parseFloat(item.unit_price),
        quantity_per_student: item.quantity_per_student,
        supplied_by: item.supplied_by,
        assigned_at: item.assigned_at,
      })),
    };

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
