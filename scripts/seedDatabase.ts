import { mockBlogPosts, mockProducts, mockCategories, mockBrands } from '../data/mockData';
import Database from 'better-sqlite3';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';

// Define types for our data structures
type Product = typeof mockProducts[0];

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
  
  try {
    let db: any;
    
    if (isRemote) {
      console.log('📡 Connecting to remote database...');
      
      // Clear all existing data without using transactions
      console.log('\n🗑️ Clearing existing data...');
      const tablesToClear = ['categories', 'brands', 'products', 'blog_posts'];
      for (const table of tablesToClear) {
        await executeRemoteSQL(`DELETE FROM ${table};`, `Clearing ${table}`);
        console.log(`✅ Cleared ${table}`);
      }
      
      // Seed categories
      console.log('\n🏷️ Seeding categories...');
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
      
      // Seed brands
      console.log('\n🏢 Seeding brands...');
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
      
      // Seed products
      console.log('\n🛍️ Seeding products...');
      await executeRemoteSQL('DELETE FROM products;', 'Clearing products');
      await executeRemoteSQL('DELETE FROM product_variations;', 'Clearing product variations');
      await executeRemoteSQL('DELETE FROM variation_attributes;', 'Clearing variation attributes');
      
      for (const product of mockProducts) {
        // Verify that category and brand exist
        const categoryExists = mockCategories.some(c => c.slug === product.categorySlug);
        const brandExists = mockBrands.some(b => b.slug === product.brandSlug);
        
        if (!categoryExists || !brandExists) {
          console.warn(`⚠️ Skipping product ${product.name} due to missing category or brand`);
          continue;
        }
        
        // Store minimal description if linked to a blog post
        const description = product.description === 'Linked to blog post with the same slug' ? '' : product.description;
        
        // Insert the product
        await executeRemoteSQL(`
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
            '${description.replace(/'/g, "''")}',
            '${product.images.replace(/'/g, "''")}',
            ${product.price},
            ${product.isActive ? 1 : 0},
            ${product.isFeatured ? 1 : 0},
            ${product.discount === null ? 'NULL' : product.discount},
            ${product.hasVariations ? 1 : 0},
            ${product.weight ? `'${product.weight.replace(/'/g, "''")}'` : 'NULL'},
            ${product.stock},
            ${product.unlimitedStock ? 1 : 0},
            '${new Date().toISOString()}'
          );
        `, `Adding product: ${product.name}`);

        // Insert variations if they exist
        if (product.hasVariations && product.variations) {
          const variations = JSON.parse(product.variations);
          for (const variation of variations) {
            // Generate a SKU if not provided
            const sku = `${product.slug}-${variation.name.toLowerCase().replace(/\s+/g, '-')}`;
            
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
                '${new Date().toISOString()}'
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
                    '${new Date().toISOString()}'
                  FROM variation_id;
                `, `Adding attribute: ${attr.attributeId} for variation: ${variation.name}`);
              }
            }
          }
          console.log(`✅ Added product: ${product.name} with ${variations.length} variations`);
        }
      }
      
      // Seed blog posts
      console.log('\n📝 Seeding blog posts...');
      for (const post of mockBlogPosts) {
        // If post has productSlug, store null for images (they'll come from product)
        const images = post.productSlug ? null : post.images;
        
        await executeRemoteSQL(`
          INSERT INTO blog_posts (
            title, slug, body, images, product_slug, 
            published_at
          )
          VALUES (
            '${post.title.replace(/'/g, "''")}',
            '${post.slug.replace(/'/g, "''")}',
            '${post.body.replace(/'/g, "''")}',
            ${images ? `'${images.replace(/'/g, "''")}'` : 'NULL'},
            ${post.productSlug ? `'${post.productSlug.replace(/'/g, "''")}'` : 'NULL'},
            '${post.publishedAt}'
          );
        `, `Adding blog post: ${post.title}`);
      }
      console.log(`✅ Added ${mockBlogPosts.length} blog posts`);
      
      console.log(`\n🎉 Remote database seeded successfully!`);
      
    } else {
      // Local database seeding
      const dbPath = findLocalDbPath();
      if (!dbPath) {
        console.error('❌ Could not find local SQLite database file.');
        process.exit(1);
      }
      
      console.log(`📂 Using database at: ${dbPath}`);
      
      // Connect directly to the SQLite database
      db = new Database(dbPath);
      
      try {
        // Begin transaction
        db.prepare('BEGIN').run();
        
        // Clear tables in reverse dependency order
        console.log('🗑️ Clearing existing data...');
        const tablesToClear = [
          'variation_attributes',    // Child of product_variations
          'product_variations',      // Child of products
          'blog_posts',             // References products
          'products',               // Child of categories and brands
          'categories',             // Independent
          'brands'                  // Independent
        ];
        
        for (const table of tablesToClear) {
          db.prepare(`DELETE FROM ${table}`).run();
          console.log(`✅ Cleared ${table}`);
        }
        
        // Seed categories first (no dependencies)
        console.log('\n🏷️ Seeding categories...');
        const insertCategory = db.prepare(`
          INSERT INTO categories (name, slug, is_active)
          VALUES (?, ?, ?)
          RETURNING id
        `);
        
        try {
          for (const category of mockCategories) {
            const result = insertCategory.run(
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
        
        // Seed brands next (no dependencies)
        console.log('\n🏢 Seeding brands...');
        const insertBrand = db.prepare(`
          INSERT INTO brands (name, slug, is_active)
          VALUES (?, ?, ?)
          RETURNING id
        `);
        
        try {
          for (const brand of mockBrands) {
            const result = insertBrand.run(
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
        
        // Prepare all statements for products and variations
        const insertProduct = db.prepare(`
          INSERT INTO products (
            category_slug,
            brand_slug,
            name,
            slug,
            description,
            images,
            price,
            is_active,
            is_featured,
            discount,
            has_variations,
            weight,
            stock,
            unlimited_stock,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING id
        `);

        const insertVariation = db.prepare(`
          INSERT INTO product_variations (
            product_id, sku, price, stock, sort,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?)
          RETURNING id
        `);

        const insertVariationAttribute = db.prepare(`
          INSERT INTO variation_attributes (
            product_variation_id, attributeId, value,
            created_at
          )
          VALUES (?, ?, ?, ?)
        `);
        
        // Create a compound operation for inserting a product with its variations
        const insertProductWithVariations = db.transaction((product: Product) => {
          // Verify category and brand exist
          const categoryExists = db.prepare('SELECT slug FROM categories WHERE slug = ?').get(product.categorySlug);
          const brandExists = db.prepare('SELECT slug FROM brands WHERE slug = ?').get(product.brandSlug);
          
          if (!categoryExists || !brandExists) {
            console.warn(`⚠️ Skipping product ${product.name} due to missing category (${product.categorySlug}) or brand (${product.brandSlug})`);
            return;
          }
          
          try {
            // Insert the product
            const { id: productId } = insertProduct.get(
              product.categorySlug,
              product.brandSlug,
              product.name,
              product.slug,
              product.description,
              product.images,
              product.price,
              product.isActive ? 1 : 0,
              product.isFeatured ? 1 : 0,
              product.discount === null ? null : product.discount,
              product.hasVariations ? 1 : 0,
              product.weight || null,
              product.stock,
              product.unlimitedStock ? 1 : 0,
              new Date().toISOString()
            );
            
            // Insert variations if they exist
            if (product.hasVariations && product.variations) {
              const variations = JSON.parse(product.variations);
              for (const variation of variations) {
                // Insert variation
                const { id: variationId } = insertVariation.get(
                  productId,
                  variation.sku,
                  variation.price,
                  variation.stock,
                  variation.sort || 0,
                  new Date().toISOString()
                );

                // Insert variation attributes
                if (variation.attributes && Array.isArray(variation.attributes)) {
                  for (const attr of variation.attributes) {
                    insertVariationAttribute.run(
                      variationId,
                      attr.attributeId,
                      attr.value,
                      new Date().toISOString()
                    );
                  }
                }
              }
              console.log(`✅ Added product: ${product.name} with ${variations.length} variations`);
            } else {
              console.log(`✅ Added product: ${product.name}`);
            }
          } catch (error) {
            console.error(`❌ Error adding product ${product.name}:`, error);
            throw error; // Re-throw to trigger transaction rollback
          }
        });
        
        // Seed products and their variations in a single transaction per product
        console.log('\n🛍️ Seeding products...');
        for (const product of mockProducts) {
          insertProductWithVariations(product);
        }
        
        // Seed blog posts last (they reference products)
        console.log('\n📝 Seeding blog posts...');
        const insertBlogPost = db.prepare(`
          INSERT INTO blog_posts (
            title, slug, body, images, product_slug, 
            published_at
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        const checkProductExists = db.prepare('SELECT slug FROM products WHERE slug = ?');

        try {
          for (const post of mockBlogPosts) {
            const images = post.productSlug ? null : post.images;
            
            // Verify product exists if productSlug is provided
            let finalProductSlug: string | null = post.productSlug;
            if (finalProductSlug) {
              const productExists = checkProductExists.get(finalProductSlug);
              if (!productExists) {
                console.warn(`⚠️ Blog post "${post.title}" references non-existent product "${finalProductSlug}". Setting productSlug to null.`);
                finalProductSlug = null;
              }
            }
            
            insertBlogPost.run(
              post.title,
              post.slug,
              post.body,
              images,
              finalProductSlug,
              post.publishedAt
            );
            
            if (finalProductSlug) {
              console.log(`✅ Added blog post: ${post.title} (linked to product: ${finalProductSlug})`);
            } else {
              console.log(`✅ Added blog post: ${post.title}`);
            }
          }
        } catch (error) {
          console.error('❌ Error seeding blog posts:', error);
          throw error;
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