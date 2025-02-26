import { NextResponse } from "next/server";

// Hardcoded list of predefined attributes as simple strings
const PREDEFINED_ATTRIBUTES = [
  "Size",
  "Size cm",
  "Color",
  "Weight g",
  "Apparel type"
];

// Get all predefined attributes
export async function GET() {
  try {
    return NextResponse.json({
      attributes: PREDEFINED_ATTRIBUTES
    });
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return NextResponse.json(
      { error: "Failed to fetch attributes" },
      { status: 500 }
    );
  }
}

