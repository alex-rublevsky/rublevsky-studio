import { cwd } from 'node:process';
import { loadEnvConfig } from '@next/env';
import { eq } from 'drizzle-orm';

import db from './db';
import * as schema from './schema';
import { sampleData } from '@/lib/sample-data';

// Load environment variables
loadEnvConfig(cwd());

const main = async() => {
  try {
    console.log('Seeding database...');
    
    // First, delete related tables to avoid foreign key constraints
    console.log('Deleting existing data...');
    // Delete accounts first since they reference users
    await db.delete(schema.accounts);
    // Then delete users
    await db.delete(schema.users);
    
    // Seed users
    console.log('Seeding users...');
    const resUsers = await db
      .insert(schema.users)
      .values(sampleData.users)
      .returning();
    console.log({ resUsers });
    
    // First, seed categories
    console.log('Seeding categories...');
    await db.delete(schema.categories);
    const resCategories = await db
      .insert(schema.categories)
      .values(sampleData.categories)
      .returning();
    console.log({ resCategories });
    
    // Then, seed brands
    console.log('Seeding brands...');
    await db.delete(schema.brands);
    const resBrands = await db
      .insert(schema.brands)
      .values(sampleData.brands)
      .returning();
    console.log({ resBrands });
    
    // Finally, seed products
    console.log('Seeding products...');
    await db.delete(schema.products);
    const resProducts = await db
      .insert(schema.products)
      .values(sampleData.products.map(product => ({
        ...product,
        // Use the IDs from the newly inserted categories and brands
        categoryId: resCategories[0].id,
        brandId: resBrands[0].id,
        images: JSON.stringify(product.images)
      })))
      .returning();
    console.log({ resProducts });
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error(error);
    throw new Error('Failed to seed database');
  }
};

main();
