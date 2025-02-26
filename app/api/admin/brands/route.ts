import { NextResponse } from "next/server";
import db from "../../../../server/db";
import { brands } from "../../../../server/schema";

export async function GET() {
  try {
    const allBrands = await db.select().from(brands).all();
    
    return NextResponse.json(
      { brands: allBrands },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { message: "Failed to fetch brands", error: (error as Error).message },
      { status: 500 }
    );
  }
} 