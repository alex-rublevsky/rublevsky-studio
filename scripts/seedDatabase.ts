//TODO separate seeding into chunks to be able to seed particular tables only
//

import { mockBlogPosts, mockProducts, mockCategories, mockBrands, mockTeaCategories } from '../data/mockData';
import Database from 'better-sqlite3';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';

// Define types for our data structures
type Product = {
  name: string;
  slug: string;
  description: string;
  images: string;
  price: number;
  isActive: boolean;
  isFeatured: boolean;
  discount: number | null;
  hasVariations: boolean;
  stock: number;
  unlimitedStock: boolean;
  categorySlug: string;
  brandSlug: string;
  teaCategories?: string[];
  variations?: string;
  weight?: string;
};

// Define available tables for seeding
type TableName = 
  | 'tea_categories'
  | 'categories'
  | 'brands'
  | 'products'
  | 'blog_posts'
  | 'all';

// Define table dependencies
const tableDependencies: Record<TableName, TableName[]> = {
  tea_categories: [],
  categories: [],
  brands: [],
  products: ['categories', 'brands', 'tea_categories'],
  blog_posts: ['tea_categories'],
  all: []
};

// Define dependent tables that need to be cleared when clearing a specific table
const tableDependentClearMap: Record<TableName, string[]> = {
  products: ['variation_attributes', 'product_variations', 'product_tea_categories'],
  blog_posts: ['blog_tea_categories'],
  tea_categories: ['product_tea_categories', 'blog_tea_categories'],
  categories: [],
  brands: [],
  all: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Check if we're targeting the remote database
const isRemote = process.argv.includes('--remote');
const DB_NAME = 'rublevsky-studio-storage';

// Get tables to seed from command line arguments
const tablesToSeed = process.argv
  .filter(arg => arg.startsWith('--table='))
  .map(arg => arg.replace('--table=', '')) as TableName[];

// If no specific tables are specified, seed all tables
const shouldSeedAll = tablesToSeed.length === 0 || tablesToSeed.includes('all');

// Function to get all required tables including dependencies
function getRequiredTables(tables: TableName[]): TableName[] {
  const required = new Set<TableName>();
  
  function addDependencies(table: TableName) {
    if (!required.has(table)) {
      required.add(table);
      tableDependencies[table]?.forEach(dep => addDependencies(dep));
    }
  }
  
  tables.forEach(table => addDependencies(table));
  return Array.from(required);
}

// Get the final list of tables to seed
const finalTablesToSeed = shouldSeedAll 
  ? ['tea_categories', 'categories', 'brands', 'products', 'blog_posts'] 
  : getRequiredTables(tablesToSeed);

// Function to clear specific tables
async function clearTables(tables: string[], db?: any) {
  console.log('\n🗑️ Clearing existing data...');
  
  // Get all tables that need to be cleared based on dependencies
  const tablesToClear = new Set<string>();
  
  tables.forEach(table => {
    // Add the table itself
    tablesToClear.add(table);
    // Add its dependent tables that need to be cleared
    if (tableDependentClearMap[table as TableName]) {
      tableDependentClearMap[table as TableName].forEach(depTable => 
        tablesToClear.add(depTable)
      );
    }
  });
  
  const sortedTablesToDelete = Array.from(tablesToClear).sort((a, b) => {
    // Clear dependent tables first (e.g., clear product_tea_categories before products)
    const aIsDep = a.includes('_');
    const bIsDep = b.includes('_');
    if (aIsDep && !bIsDep) return -1;
    if (!aIsDep && bIsDep) return 1;
    return 0;
  });
  
  if (isRemote) {
    for (const table of sortedTablesToDelete) {
      await executeRemoteSQL(`DELETE FROM ${table};`, `Clearing ${table}`);
      console.log(`✅ Cleared ${table}`);
    }
  } else if (db) {
    for (const table of sortedTablesToDelete) {
      db.prepare(`DELETE FROM ${table}`).run();
      console.log(`✅ Cleared ${table}`);
    }
  }
}

// Seeding functions for each table type
async function seedTeaCategories(db?: any) {
  if (!finalTablesToSeed.includes('tea_categories')) return;
  
  console.log('\n🍵 Seeding tea categories...');
  if (isRemote) {
    for (const teaCategory of mockTeaCategories) {
      await executeRemoteSQL(`
        INSERT INTO tea_categories (name, slug, is_active)
        VALUES (
          '${teaCategory.name.replace(/'/g, "''")}',
          '${teaCategory.slug.replace(/'/g, "''")}',
          ${teaCategory.isActive ? 1 : 0}
        );
      `, `Adding tea category: ${teaCategory.name}`);
    }
    console.log(`✅ Added ${mockTeaCategories.length} tea categories`);
  } else if (db) {
    const insertTeaCategory = db.prepare(`
      INSERT INTO tea_categories (name, slug, is_active)
      VALUES (?, ?, ?)
    `);
    
    try {
      for (const category of mockTeaCategories) {
        insertTeaCategory.run(
          category.name,
          category.slug,
          category.isActive ? 1 : 0
        );
        console.log(`✅ Added tea category: ${category.name}`);
      }
    } catch (error) {
      console.error('❌ Error seeding tea categories:', error);
      throw error;
    }
  }
}

async function seedCategories(db?: any) {
  if (!finalTablesToSeed.includes('categories')) return;
  
  console.log('\n🏷️ Seeding categories...');
  if (isRemote) {
    for (const category of mockCategories) {
      await executeRemoteSQL(`
        INSERT INTO categories (name, slug, is_active)
        VALUES (
          '${category.name.replace(/'/g, "''")}',
          '${category.slug.replace(/'/g, "''")}',
          ${category.isActive ? 1 : 0}
        );
      `, `Adding category: ${category.name}`);
    }
    console.log(`✅ Added ${mockCategories.length} categories`);
  } else if (db) {
    const insertCategory = db.prepare(`
      INSERT INTO categories (name, slug, is_active)
      VALUES (?, ?, ?)
      RETURNING id
    `);
    
    try {
      for (const category of mockCategories) {
        insertCategory.run(
          category.name,
          category.slug,
          category.isActive ? 1 : 0
        );
        console.log(`✅ Added category: ${category.name} (${category.slug})`);
      }
    } catch (error) {
      console.error('❌ Error seeding categories:', error);
      throw error;
    }
  }
}

async function seedBrands(db?: any) {
  if (!finalTablesToSeed.includes('brands')) return;
  
  console.log('\n🏢 Seeding brands...');
  if (isRemote) {
    for (const brand of mockBrands) {
      await executeRemoteSQL(`
        INSERT INTO brands (name, slug, is_active)
        VALUES (
          '${brand.name.replace(/'/g, "''")}',
          '${brand.slug.replace(/'/g, "''")}',
          ${brand.isActive ? 1 : 0}
        );
      `, `Adding brand: ${brand.name}`);
    }
    console.log(`✅ Added ${mockBrands.length} brands`);
  } else if (db) {
    const insertBrand = db.prepare(`
      INSERT INTO brands (name, slug, is_active)
      VALUES (?, ?, ?)
      RETURNING id
    `);
    
    try {
      for (const brand of mockBrands) {
        insertBrand.run(
          brand.name,
          brand.slug,
          brand.isActive ? 1 : 0
        );
        console.log(`✅ Added brand: ${brand.name} (${brand.slug})`);
      }
    } catch (error) {
      console.error('❌ Error seeding brands:', error);
      throw error;
    }
  }
}

// Dynamically find the SQLite database file
function findLocalDbPath() {
  const basePath = resolve('./.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
  
  if (!existsSync(basePath)) {
    console.error('❌ No SQLite database found. Make sure you have run your app locally first.');
    process.exit(1);
  }
  
  const files = readdirSync(basePath).filter(f => f.endsWith('.sqlite'));
  return files.length > 0 ? resolve(basePath, files[0]) : null;
}

// Function to execute remote SQL commands
function executeRemoteSQL(command: string, description?: string) {
  try {
    if (description) {
      console.log(`${colors.blue}Executing: ${description}${colors.reset}`);
    }
    const output = execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command="${command.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8'
    });

    if (description) {
      console.log(`${colors.green}✅ Successfully executed: ${description}${colors.reset}`);
    }

    // Try to parse the output as JSON
    try {
      // Find the JSON part of the output (it's usually after some wrangler logs)
      const jsonStart = output.indexOf('[');
      if (jsonStart !== -1) {
        const jsonPart = output.slice(jsonStart);
        const results = JSON.parse(jsonPart);
        return results[0]; // Return the first result
      }
    } catch (parseError) {
      console.log('Could not parse results as JSON:', parseError);
    }

    return null;
  } catch (error) {
    console.error(`${colors.red}❌ Error executing remote SQL:${colors.reset}`, error);
    throw error;
  }
}

// Function to create a batched insert command
function createBatchInsert(tableName: string, columns: string[], values: any[][]) {
  const placeholders = values.map(() => 
    `(${columns.map(() => '?').join(', ')})`
  ).join(',\n');
  
  return `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES ${placeholders};
  `;
}

async function seedDatabase() {
  console.log(`🌱 Seeding ${isRemote ? 'remote' : 'local'} database...`);
  console.log(`📊 Tables to seed: ${finalTablesToSeed.join(', ')}`);
  
  try {
    let db: any;
    
    if (isRemote) {
      console.log('📡 Connecting to remote database...');
      
      // Clear and seed tables in order
      await clearTables(finalTablesToSeed);
      await seedTeaCategories();
      await seedCategories();
      await seedBrands();
      
      if (finalTablesToSeed.includes('products')) {
        // Seed products
        console.log('\n🛍️ Seeding products...');
        for (const product of mockProducts) {
          // Insert the product first
          const result = await executeRemoteSQL(`
            INSERT INTO products (
              category_slug, brand_slug, name, slug, description, images, 
              price, is_active, is_featured, discount, has_variations, 
              weight, stock, unlimited_stock, created_at
            )
            VALUES (
              '${product.categorySlug.replace(/'/g, "''")}',
              '${product.brandSlug.replace(/'/g, "''")}',
              '${product.name.replace(/'/g, "''")}',
              '${product.slug.replace(/'/g, "''")}',
              '${product.description.replace(/'/g, "''")}',
              '${product.images.replace(/'/g, "''")}',
              ${product.price},
              ${product.isActive ? 1 : 0},
              ${product.isFeatured ? 1 : 0},
              ${product.discount === null ? 'NULL' : product.discount},
              ${product.hasVariations ? 1 : 0},
              ${product.weight ? `'${product.weight.replace(/'/g, "''")}'` : 'NULL'},
              ${product.stock},
              ${product.unlimitedStock ? 1 : 0},
              ${Math.floor(Date.now() / 1000)}
            ) RETURNING id;
          `, `Adding product: ${product.name}`);

          // Insert tea categories if they exist and we have a valid product ID
          if (product.teaCategories && Array.isArray(product.teaCategories) && result && result.id) {
            for (const teaCategorySlug of product.teaCategories) {
              // Verify tea category exists before inserting
              const teaCategoryExists = await executeRemoteSQL(`
                SELECT slug FROM tea_categories WHERE slug = '${teaCategorySlug.replace(/'/g, "''")}';
              `, `Verifying tea category: ${teaCategorySlug}`);

              if (!teaCategoryExists) {
                console.warn(`⚠️ Skipping invalid tea category "${teaCategorySlug}" for product: ${product.name}`);
                continue;
              }

              await executeRemoteSQL(`
                INSERT INTO product_tea_categories (product_id, tea_category_slug)
                VALUES (${result.id}, '${teaCategorySlug.replace(/'/g, "''")}');
              `, `Adding tea category ${teaCategorySlug} to product: ${product.name}`);
            }
          }

          // Insert variations if they exist
          if (product.hasVariations && product.variations) {
            const variations = JSON.parse(product.variations);
            for (const variation of variations) {
              // Generate a SKU using variation attributes or a fallback
              const sku = variation.sku || `${product.slug}-${variation.attributes?.map((attr: { value: string }) => attr.value.toLowerCase()).join('-') || Date.now()}`;
              
              // Insert variation
              await executeRemoteSQL(`
                WITH product_id AS (
                  SELECT id FROM products WHERE slug = '${product.slug.replace(/'/g, "''")}'
                )
                INSERT INTO product_variations (
                  product_id, sku, price, stock, sort,
                  created_at
                )
                SELECT 
                  product_id.id,
                  '${sku.replace(/'/g, "''")}',
                  ${variation.price},
                  ${variation.stock},
                  ${variation.sort || 0},
                  ${Math.floor(Date.now() / 1000)}
                FROM product_id;
              `, `Adding variation: ${variation.name} for product: ${product.name}`);

              // Insert variation attributes
              if (variation.attributes && Array.isArray(variation.attributes)) {
                for (const attr of variation.attributes) {
                  await executeRemoteSQL(`
                    WITH variation_id AS (
                      SELECT pv.id 
                      FROM product_variations pv
                      JOIN products p ON p.id = pv.product_id
                      WHERE p.slug = '${product.slug.replace(/'/g, "''")}' 
                      AND pv.sku = '${sku.replace(/'/g, "''")}'
                    )
                    INSERT INTO variation_attributes (
                      product_variation_id, attributeId, value,
                      created_at
                    )
                    SELECT 
                      variation_id.id,
                      '${attr.attributeId}',
                      '${attr.value}',
                      ${Math.floor(Date.now() / 1000)}
                    FROM variation_id;
                  `, `Adding attribute: ${attr.attributeId} for variation: ${variation.name}`);
                }
              }
            }
            console.log(`✅ Added product: ${product.name} with ${variations.length} variations`);
          }
        }
      }
      
      if (finalTablesToSeed.includes('blog_posts')) {
        // Seed blog posts
        console.log('\n📝 Seeding blog posts...');
        for (const post of mockBlogPosts) {
          // Insert the blog post first
          const result = await executeRemoteSQL(`
            INSERT INTO blog_posts (
              title, slug, body, images, product_slug,
              published_at
            )
            VALUES (
              '${post.title.replace(/'/g, "''")}',
              '${post.slug.replace(/'/g, "''")}',
              '${post.body.replace(/'/g, "''")}',
              ${post.images ? `'${post.images.replace(/'/g, "''")}'` : 'NULL'},
              ${post.productSlug ? `'${post.productSlug.replace(/'/g, "''")}'` : 'NULL'},
              ${post.publishedAt}
            ) RETURNING id;
          `, `Adding blog post: ${post.title}`);

          // Insert tea categories if they exist and we have a valid blog post ID
          if (post.teaCategories && Array.isArray(post.teaCategories) && result && result.id) {
            for (const teaCategorySlug of post.teaCategories) {
              // Verify tea category exists before inserting
              const teaCategoryExists = await executeRemoteSQL(`
                SELECT slug FROM tea_categories WHERE slug = '${teaCategorySlug.replace(/'/g, "''")}';
              `, `Verifying tea category: ${teaCategorySlug}`);

              if (!teaCategoryExists) {
                console.warn(`⚠️ Skipping invalid tea category "${teaCategorySlug}" for blog post: ${post.title}`);
                continue;
              }

              await executeRemoteSQL(`
                INSERT INTO blog_tea_categories (blog_post_id, tea_category_slug)
                VALUES (${result.id}, '${teaCategorySlug.replace(/'/g, "''")}');
              `, `Adding tea category ${teaCategorySlug} to blog post: ${post.title}`);
            }
          }
        }
      }
      
      console.log(`\n🎉 Remote database seeded successfully!`);
      
    } else {
      // Local database seeding
      const dbPath = findLocalDbPath();
      if (!dbPath) {
        console.error('❌ Could not find local SQLite database file.');
        process.exit(1);
      }
      
      console.log(`📂 Using database at: ${dbPath}`);
      db = new Database(dbPath);
      
      try {
        // Begin transaction
        db.prepare('BEGIN').run();
        
        // Clear and seed tables in order
        await clearTables(finalTablesToSeed, db);
        await seedTeaCategories(db);
        await seedCategories(db);
        await seedBrands(db);
        
        if (finalTablesToSeed.includes('products')) {
          // Seed products
          console.log('\n🛍️ Seeding products...');
          for (const product of mockProducts) {
            // Insert the product first
            const result = await executeRemoteSQL(`
              INSERT INTO products (
                category_slug, brand_slug, name, slug, description, images, 
                price, is_active, is_featured, discount, has_variations, 
                weight, stock, unlimited_stock, created_at
              )
              VALUES (
                '${product.categorySlug.replace(/'/g, "''")}',
                '${product.brandSlug.replace(/'/g, "''")}',
                '${product.name.replace(/'/g, "''")}',
                '${product.slug.replace(/'/g, "''")}',
                '${product.description.replace(/'/g, "''")}',
                '${product.images.replace(/'/g, "''")}',
                ${product.price},
                ${product.isActive ? 1 : 0},
                ${product.isFeatured ? 1 : 0},
                ${product.discount === null ? 'NULL' : product.discount},
                ${product.hasVariations ? 1 : 0},
                ${product.weight ? `'${product.weight.replace(/'/g, "''")}'` : 'NULL'},
                ${product.stock},
                ${product.unlimitedStock ? 1 : 0},
                ${Math.floor(Date.now() / 1000)}
              ) RETURNING id;
            `, `Adding product: ${product.name}`);

            // Insert tea categories if they exist and we have a valid product ID
            if (product.teaCategories && Array.isArray(product.teaCategories) && result && result.id) {
              for (const teaCategorySlug of product.teaCategories) {
                // Verify tea category exists before inserting
                const teaCategoryExists = await executeRemoteSQL(`
                  SELECT slug FROM tea_categories WHERE slug = '${teaCategorySlug.replace(/'/g, "''")}';
                `, `Verifying tea category: ${teaCategorySlug}`);

                if (!teaCategoryExists) {
                  console.warn(`⚠️ Skipping invalid tea category "${teaCategorySlug}" for product: ${product.name}`);
                  continue;
                }

                await executeRemoteSQL(`
                  INSERT INTO product_tea_categories (product_id, tea_category_slug)
                  VALUES (${result.id}, '${teaCategorySlug.replace(/'/g, "''")}');
                `, `Adding tea category ${teaCategorySlug} to product: ${product.name}`);
              }
            }

            // Insert variations if they exist
            if (product.hasVariations && product.variations) {
              const variations = JSON.parse(product.variations);
              for (const variation of variations) {
                // Insert variation
                const { id: variationId } = await executeRemoteSQL(`
                  WITH product_id AS (
                    SELECT id FROM products WHERE slug = '${product.slug.replace(/'/g, "''")}'
                  )
                  INSERT INTO product_variations (
                    product_id, sku, price, stock, sort,
                    created_at
                  )
                  SELECT 
                    product_id.id,
                    '${variation.sku || `${product.slug}-${variation.attributes?.map((attr: { value: string }) => attr.value.toLowerCase()).join('-') || Date.now()}`}',
                    ${variation.price},
                    ${variation.stock},
                    ${variation.sort || 0},
                    ${Math.floor(Date.now() / 1000)}
                  FROM product_id;
                `, `Adding variation: ${variation.name} for product: ${product.name}`);

                // Insert variation attributes
                if (variation.attributes && Array.isArray(variation.attributes)) {
                  for (const attr of variation.attributes) {
                    await executeRemoteSQL(`
                      WITH variation_id AS (
                        SELECT pv.id 
                        FROM product_variations pv
                        JOIN products p ON p.id = pv.product_id
                        WHERE p.slug = '${product.slug.replace(/'/g, "''")}' 
                        AND pv.sku = '${variation.sku || `${product.slug}-${variation.attributes?.map((attr: { value: string }) => attr.value.toLowerCase()).join('-') || Date.now()}`}'
                      )
                      INSERT INTO variation_attributes (
                        product_variation_id, attributeId, value,
                        created_at
                      )
                      SELECT 
                        variation_id.id,
                        '${attr.attributeId}',
                        '${attr.value}',
                        ${Math.floor(Date.now() / 1000)}
                      FROM variation_id;
                    `, `Adding attribute: ${attr.attributeId} for variation: ${variation.name}`);
                  }
                }
              }
              console.log(`✅ Added product: ${product.name} with ${variations.length} variations`);
            } else {
              console.log(`✅ Added product: ${product.name}`);
            }
          }
        }
        
        if (finalTablesToSeed.includes('blog_posts')) {
          // Seed blog posts
          console.log('\n📝 Seeding blog posts...');
          for (const post of mockBlogPosts) {
            // Insert the blog post first
            const result = await executeRemoteSQL(`
              INSERT INTO blog_posts (
                title, slug, body, images, product_slug,
                published_at
              )
              VALUES (
                '${post.title.replace(/'/g, "''")}',
                '${post.slug.replace(/'/g, "''")}',
                '${post.body.replace(/'/g, "''")}',
                ${post.images ? `'${post.images.replace(/'/g, "''")}'` : 'NULL'},
                ${post.productSlug ? `'${post.productSlug.replace(/'/g, "''")}'` : 'NULL'},
                ${post.publishedAt}
              ) RETURNING id;
            `, `Adding blog post: ${post.title}`);

            // Insert tea categories if they exist and we have a valid blog post ID
            if (post.teaCategories && Array.isArray(post.teaCategories) && result && result.id) {
              for (const teaCategorySlug of post.teaCategories) {
                // Verify tea category exists before inserting
                const teaCategoryExists = await executeRemoteSQL(`
                  SELECT slug FROM tea_categories WHERE slug = '${teaCategorySlug.replace(/'/g, "''")}';
                `, `Verifying tea category: ${teaCategorySlug}`);

                if (!teaCategoryExists) {
                  console.warn(`⚠️ Skipping invalid tea category "${teaCategorySlug}" for blog post: ${post.title}`);
                  continue;
                }

                await executeRemoteSQL(`
                  INSERT INTO blog_tea_categories (blog_post_id, tea_category_slug)
                  VALUES (${result.id}, '${teaCategorySlug.replace(/'/g, "''")}');
                `, `Adding tea category ${teaCategorySlug} to blog post: ${post.title}`);
              }
            }
          }
        }

        // Commit the transaction
        db.prepare('COMMIT').run();
        console.log('\n✅ All data seeded successfully!');

      } catch (error) {
        // Rollback on error
        db.prepare('ROLLBACK').run();
        throw error;
      } finally {
        // Close the database connection
        db.close();
      }
    }

    console.log(`\n🎉 ${isRemote ? 'Remote' : 'Local'} database seeded successfully!`);

  } catch (error) {
    console.error(`❌ Error seeding ${isRemote ? 'remote' : 'local'} database:`, error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();