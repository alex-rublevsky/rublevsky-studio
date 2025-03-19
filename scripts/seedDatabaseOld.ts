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
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    if (description) {
      console.log(`${colors.green}✅ Successfully executed: ${description}${colors.reset}`);
    }

    // Try to parse the output as JSON
    try {
      // Find all JSON objects in the output
      const matches = output.match(/\{[^{}]*\}/g);
      if (matches) {
        // Try each JSON object, starting from the last one
        for (let i = matches.length - 1; i >= 0; i--) {
          try {
            const jsonPart = matches[i];
            const response = JSON.parse(jsonPart);

            // For COUNT queries, look for count in the response
            if (response.count !== undefined) {
              return { count: parseInt(response.count) };
            }

            // For INSERT...RETURNING queries, look for id in the response
            if (response.id !== undefined) {
              return { id: parseInt(response.id) };
            }

            // For other queries, check if we have a results array
            if (response.results && Array.isArray(response.results)) {
              return response.results[0];
            }

            // Check for success indicator
            if (response.success || response.changes !== undefined) {
              return { success: true, changes: response.changes };
            }
          } catch (innerError) {
            // Continue to next match if this one fails
            continue;
          }
        }
      }

      // If we couldn't find any valid JSON objects but the command succeeded
      return { success: true };
    } catch (parseError) {
      console.log('Could not parse any JSON from output:', parseError);
      // Return a default success value if parsing fails but command succeeded
      return { success: true };
    }
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
          try {
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

            console.log(`Product result:`, result);

            // Insert tea categories if they exist and we have a valid product ID
            if (product.teaCategories && Array.isArray(product.teaCategories) && result && result.id) {
              console.log(`Adding tea categories for product ${product.name} (ID: ${result.id}):`, product.teaCategories);
              
              for (const teaCategorySlug of product.teaCategories) {
                // Verify tea category exists before inserting
                const teaCategoryExists = await executeRemoteSQL(`
                  SELECT COUNT(*) as count FROM tea_categories WHERE slug = '${teaCategorySlug.replace(/'/g, "''")}';
                `, `Verifying tea category: ${teaCategorySlug}`);

                if (!teaCategoryExists || teaCategoryExists.count === 0) {
                  console.warn(`⚠️ Tea category "${teaCategorySlug}" not found for product: ${product.name}`);
                  continue;
                }

                try {
                  const insertResult = await executeRemoteSQL(`
                    INSERT INTO product_tea_categories (product_id, tea_category_slug)
                    VALUES (${result.id}, '${teaCategorySlug.replace(/'/g, "''")}')
                    RETURNING id;
                  `, `Adding tea category ${teaCategorySlug} to product: ${product.name}`);

                  if (insertResult && insertResult.id) {
                    console.log(`✅ Successfully added tea category ${teaCategorySlug} to product: ${product.name} (association ID: ${insertResult.id})`);
                  } else {
                    console.warn(`⚠️ Failed to add tea category ${teaCategorySlug} to product: ${product.name} - No ID returned`);
                  }
                } catch (error) {
                  console.error(`❌ Error adding tea category ${teaCategorySlug} to product ${product.name}:`, error);
                }
              }
            } else {
              console.log(`No tea categories to add for product: ${product.name}`);
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
                    "createdAt"
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
                        product_variation_id, "attributeId", value,
                        "createdAt"
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
          } catch (error) {
            console.error(`❌ Error adding product ${product.name}:`, error);
            throw error;
          }
        }
      }
      
      if (finalTablesToSeed.includes('blog_posts')) {
        // Seed blog posts
        console.log('\n📝 Seeding blog posts...');
        for (const post of mockBlogPosts) {
          try {
            // Prepare the content by escaping only single quotes, preserving markdown formatting
            if (!post.title || !post.slug || !post.body) {
              console.error('Skipping post due to missing required fields:', post);
              continue;
            }
            const escapedTitle = post.title.replace(/'/g, "''");
            const escapedSlug = post.slug.replace(/'/g, "''");
            const escapedBody = post.body.replace(/'/g, "''"); // Remove .replace(/\n/g, '\\n') to preserve markdown
            const escapedImages = post.images ? post.images.replace(/'/g, "''") : null;
            const escapedProductSlug = post.productSlug ? post.productSlug.replace(/'/g, "''") : null;

            // Split the command into smaller parts for better readability and reliability
            const insertCommand = `
              INSERT INTO blog_posts (
                title, slug, body, images, product_slug,
                published_at
              )
              VALUES (
                '${escapedTitle}',
                '${escapedSlug}',
                '${escapedBody}',
                ${escapedImages ? `'${escapedImages}'` : 'NULL'},
                ${escapedProductSlug ? `'${escapedProductSlug}'` : 'NULL'},
                ${post.publishedAt}
              ) RETURNING id;
            `.trim();

            // Insert the blog post
            const result = await executeRemoteSQL(insertCommand, `Adding blog post: ${post.title}`);

            console.log(`Blog post result:`, result);

            // Insert tea categories if they exist and we have a valid blog post ID
            if (post.teaCategories && Array.isArray(post.teaCategories) && result && result.id) {
              console.log(`Adding tea categories for blog post ${post.title} (ID: ${result.id}):`, post.teaCategories);
              
              for (const teaCategorySlug of post.teaCategories) {
                // Verify tea category exists before inserting
                const teaCategoryExists = await executeRemoteSQL(`
                  SELECT COUNT(*) as count FROM tea_categories WHERE slug = '${teaCategorySlug.replace(/'/g, "''")}';
                `, `Verifying tea category: ${teaCategorySlug}`);

                if (!teaCategoryExists || teaCategoryExists.count === 0) {
                  console.warn(`⚠️ Tea category "${teaCategorySlug}" not found for blog post: ${post.title}`);
                  continue;
                }

                try {
                  const insertResult = await executeRemoteSQL(`
                    INSERT INTO blog_tea_categories (blog_post_id, tea_category_slug)
                    VALUES (${result.id}, '${teaCategorySlug.replace(/'/g, "''")}')
                    RETURNING id;
                  `, `Adding tea category ${teaCategorySlug} to blog post: ${post.title}`);

                  if (insertResult && insertResult.id) {
                    console.log(`✅ Successfully added tea category ${teaCategorySlug} to blog post: ${post.title} (association ID: ${insertResult.id})`);
                  } else {
                    console.warn(`⚠️ Failed to add tea category ${teaCategorySlug} to blog post: ${post.title} - No ID returned`);
                  }
                } catch (error) {
                  console.error(`❌ Error adding tea category ${teaCategorySlug} to blog post ${post.title}:`, error);
                }
              }
            } else {
              console.log(`No tea categories to add for blog post: ${post.title}`);
            }

            console.log(`✅ Added blog post: ${post.title}`);
          } catch (error) {
            console.error(`❌ Error adding blog post ${post.title}:`, error);
            throw error;
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
          // Seed products first since they're referenced by blog posts
          console.log('\n🛍️ Seeding products...');
          const insertProduct = db.prepare(`
            INSERT INTO products (
              category_slug, brand_slug, name, slug, description, images,
              price, is_active, is_featured, discount, has_variations,
              weight, stock, unlimited_stock, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const insertProductTeaCategory = db.prepare(`
            INSERT INTO product_tea_categories (product_id, tea_category_slug)
            VALUES (?, ?)
          `);

          for (const product of mockProducts) {
            try {
              const result = insertProduct.run(
                product.categorySlug,
                product.brandSlug,
                product.name,
                product.slug,
                product.description,
                product.images,
                product.price,
                product.isActive ? 1 : 0,
                product.isFeatured ? 1 : 0,
                product.discount,
                product.hasVariations ? 1 : 0,
                product.weight || null,
                product.stock,
                product.unlimitedStock ? 1 : 0,
                Math.floor(Date.now() / 1000)
              );

              if (product.teaCategories && Array.isArray(product.teaCategories) && result.lastInsertRowid) {
                for (const teaCategorySlug of product.teaCategories) {
                  insertProductTeaCategory.run(result.lastInsertRowid, teaCategorySlug);
                }
              }

              console.log(`✅ Added product: ${product.name}`);
            } catch (error) {
              console.error(`❌ Error adding product ${product.name}:`, error);
              throw error;
            }
          }
        }
        
        if (finalTablesToSeed.includes('blog_posts')) {
          // Seed blog posts
          console.log('\n📝 Seeding blog posts...');
          const insertBlogPost = db.prepare(`
            INSERT INTO blog_posts (
              title, slug, body, images, product_slug, published_at
            ) VALUES (?, ?, ?, ?, ?, ?)
          `);

          const insertBlogTeaCategory = db.prepare(`
            INSERT INTO blog_tea_categories (blog_post_id, tea_category_slug)
            VALUES (?, ?)
          `);

          const verifyTeaCategory = db.prepare(`
            SELECT COUNT(*) as count FROM tea_categories WHERE slug = ?
          `);

          for (const post of mockBlogPosts) {
            try {
              // Insert blog post
              const result = insertBlogPost.run(
                post.title,
                post.slug,
                post.body,
                post.images || null,
                post.productSlug || null,
                post.publishedAt
              );

              // Insert tea categories if they exist
              if (post.teaCategories && Array.isArray(post.teaCategories) && result.lastInsertRowid) {
                for (const teaCategorySlug of post.teaCategories) {
                  const exists = verifyTeaCategory.get(teaCategorySlug);
                  
                  if (!exists || exists.count === 0) {
                    console.warn(`⚠️ Tea category "${teaCategorySlug}" not found for blog post: ${post.title}`);
                    continue;
                  }

                  insertBlogTeaCategory.run(result.lastInsertRowid, teaCategorySlug);
                  console.log(`✅ Added tea category ${teaCategorySlug} to blog post: ${post.title}`);
                }
              }

              console.log(`✅ Added blog post: ${post.title}`);
            } catch (error) {
              console.error(`❌ Error adding blog post ${post.title}:`, error);
              throw error;
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
    process.exit(1);
  }
}

seedDatabase();