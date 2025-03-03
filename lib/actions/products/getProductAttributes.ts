'use server';

/**
 * Server action to fetch predefined product attributes
 * @returns Array of predefined attribute names
 */
export default async function getProductAttributes(): Promise<string[]> {
  try {
    // Hardcoded list of predefined attributes as simple strings
    const PREDEFINED_ATTRIBUTES = [
      "Size",
      "Size cm",
      "Color",
      "Weight g",
      "Apparel type"
    ];
    
    return PREDEFINED_ATTRIBUTES;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    throw new Error(`Failed to fetch attributes: ${(error as Error).message}`);
  }
} 