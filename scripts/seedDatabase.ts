import { mockBlogPosts, mockProducts, mockCategories, mockBrands } from '../data/mockData';
import Database from 'better-sqlite3';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';

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
    execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command="${command.replace(/"/g, '\\"')}"`, {
      stdio: 'inherit'
    });
    if (description) {
      console.log(`${colors.green}✅ Successfully executed: ${description}${colors.reset}`);
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
          INSERT INTO categories (name, slug, is_active, created_at, updated_at)
          VALUES (
            '${category.name.replace(/'/g, "''")}',
            '${category.slug.replace(/'/g, "''")}',
            ${category.isActive ? 1 : 0},
            '${new Date().toISOString()}',
            '${new Date().toISOString()}'
          );
        `, `Adding category: ${category.name}`);
      }
      console.log(`✅ Added ${mockCategories.length} categories`);
      
      // Seed brands
      console.log('\n🏢 Seeding brands...');
      for (const brand of mockBrands) {
        await executeRemoteSQL(`
          INSERT INTO brands (name, slug, is_active, created_at, updated_at)
          VALUES (
            '${brand.name.replace(/'/g, "''")}',
            '${brand.slug.replace(/'/g, "''")}',
            ${brand.isActive ? 1 : 0},
            '${new Date().toISOString()}',
            '${new Date().toISOString()}'
          );
        `, `Adding brand: ${brand.name}`);
      }
      console.log(`✅ Added ${mockBrands.length} brands`);
      
      // Seed products
      console.log('\n🛍️ Seeding products...');
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
        
        await executeRemoteSQL(`
          INSERT INTO products (
            category_slug, brand_slug, name, slug, description, images, 
            price, is_active, is_featured, on_sale, has_variations, 
            has_volume, volume, stock, unlimited_stock, created_at, updated_at
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
            ${product.onSale ? 1 : 0},
            ${product.hasVariations ? 1 : 0},
            ${product.hasVolume ? 1 : 0},
            ${product.volume ? `'${product.volume.replace(/'/g, "''")}'` : 'NULL'},
            ${product.stock},
            ${product.unlimitedStock ? 1 : 0},
            '${new Date().toISOString()}',
            '${new Date().toISOString()}'
          );
        `, `Adding product: ${product.name}`);
      }
      console.log(`✅ Added products successfully`);
      
      // Seed blog posts
      console.log('\n📝 Seeding blog posts...');
      for (const post of mockBlogPosts) {
        // If post has productSlug, store null for images (they'll come from product)
        const images = post.productSlug ? null : post.images;
        
        await executeRemoteSQL(`
          INSERT INTO blog_posts (
            title, slug, body, images, product_slug, 
            published_at, created_at, updated_at
          )
          VALUES (
            '${post.title.replace(/'/g, "''")}',
            '${post.slug.replace(/'/g, "''")}',
            '${post.body.replace(/'/g, "''")}',
            ${images ? `'${images.replace(/'/g, "''")}'` : 'NULL'},
            ${post.productSlug ? `'${post.productSlug.replace(/'/g, "''")}'` : 'NULL'},
            '${post.publishedAt}',
            '${new Date().toISOString()}',
            '${new Date().toISOString()}'
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
      
      // Seed categories
      console.log('\n🏷️ Seeding categories...');
      db.prepare('DELETE FROM categories').run();
      console.log('🗑️ Cleared existing categories');
      
      const insertCategory = db.prepare(`
        INSERT INTO categories (name, slug, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const category of mockCategories) {
        insertCategory.run(
          category.name,
          category.slug,
          category.isActive ? 1 : 0,
          new Date().toISOString(),
          new Date().toISOString()
        );
        console.log(`✅ Added category: ${category.name}`);
      }
      
      // Seed brands
      console.log('\n🏢 Seeding brands...');
      db.prepare('DELETE FROM brands').run();
      console.log('🗑️ Cleared existing brands');
      
      const insertBrand = db.prepare(`
        INSERT INTO brands (name, slug, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const brand of mockBrands) {
        insertBrand.run(
          brand.name,
          brand.slug,
          brand.isActive ? 1 : 0,
          new Date().toISOString(),
          new Date().toISOString()
        );
        console.log(`✅ Added brand: ${brand.name}`);
      }
      
      // Seed products
      console.log('\n🛍️ Seeding products...');
      db.prepare('DELETE FROM products').run();
      console.log('🗑️ Cleared existing products');
      
      const insertProduct = db.prepare(`
        INSERT INTO products (
          category_slug, brand_slug, name, slug, description, images, 
          price, is_active, is_featured, on_sale, has_variations, 
          has_volume, volume, stock, unlimited_stock, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const product of mockProducts) {
        // Verify that category and brand exist
        const categoryExists = mockCategories.some(c => c.slug === product.categorySlug);
        const brandExists = mockBrands.some(b => b.slug === product.brandSlug);
        
        if (!categoryExists || !brandExists) {
          console.warn(`⚠️ Skipping product ${product.name} due to missing category or brand`);
          continue;
        }
        
        // Store minimal description if not linked to a blog post
        let description = product.description;
        if (description === 'Linked to blog post with the same slug') {
          description = ''; // Empty description, will be populated from blog post
        }
        
        insertProduct.run(
          product.categorySlug,
          product.brandSlug,
          product.name,
          product.slug,
          description,
          product.images,
          product.price,
          product.isActive ? 1 : 0,
          product.isFeatured ? 1 : 0,
          product.onSale ? 1 : 0,
          product.hasVariations ? 1 : 0,
          product.hasVolume ? 1 : 0,
          product.volume || null,
          product.stock,
          product.unlimitedStock ? 1 : 0,
          new Date().toISOString(),
          new Date().toISOString()
        );
        
        console.log(`✅ Added product: ${product.name}`);
      }
      
      // Seed blog posts
      console.log('\n📝 Seeding blog posts...');
      db.prepare('DELETE FROM blog_posts').run();
      console.log('🗑️ Cleared existing blog posts');
      
      const insertBlogPost = db.prepare(`
        INSERT INTO blog_posts (
          title, slug, body, images, product_slug, 
          published_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const post of mockBlogPosts) {
        // If post has productSlug, store null for images (they'll come from product)
        const images = post.productSlug ? null : post.images;
        
        insertBlogPost.run(
          post.title,
          post.slug,
          post.body,
          images,
          post.productSlug,
          post.publishedAt,
          new Date().toISOString(),
          new Date().toISOString()
        );
        
        if (post.productSlug) {
          console.log(`✅ Added blog post: ${post.title} (linked to product: ${post.productSlug})`);
        } else {
          console.log(`✅ Added blog post: ${post.title}`);
        }
      }
      
      // Close the database connection
      db.close();
    }
    
    console.log(`\n🎉 ${isRemote ? 'Remote' : 'Local'} database seeded successfully!`);
    
  } catch (error) {
    console.error(`❌ Error seeding ${isRemote ? 'remote' : 'local'} database:`, error);
  } finally {
    process.exit(0);
  }
}

seedDatabase(); 