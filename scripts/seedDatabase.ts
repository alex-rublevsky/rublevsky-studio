import { mockBlogPosts, mockProducts, mockCategories, mockBrands } from '../data/mockData';
import Database from 'better-sqlite3';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';

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

async function seedDatabase() {
  console.log('🌱 Seeding database...');
  
  try {
    // Find the local database path
    const dbPath = findLocalDbPath();
    if (!dbPath) {
      console.error('❌ Could not find local SQLite database file.');
      process.exit(1);
    }
    
    console.log(`📂 Using database at: ${dbPath}`);
    
    // Connect directly to the SQLite database
    const db = new Database(dbPath);
    
    // Seed categories
    console.log('\n🏷️ Seeding categories...');
    db.prepare('DELETE FROM categories').run();
    console.log('🗑️ Cleared existing categories');
    
    const categoryMap = new Map();
    const insertCategory = db.prepare(`
      INSERT INTO categories (name, slug, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    for (const category of mockCategories) {
      const result = insertCategory.run(
        category.name,
        category.slug,
        category.isActive ? 1 : 0,
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      categoryMap.set(category.slug, result.lastInsertRowid);
      console.log(`✅ Added category: ${category.name}`);
    }
    
    // Seed brands
    console.log('\n🏢 Seeding brands...');
    db.prepare('DELETE FROM brands').run();
    console.log('🗑️ Cleared existing brands');
    
    const brandMap = new Map();
    const insertBrand = db.prepare(`
      INSERT INTO brands (name, slug, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    for (const brand of mockBrands) {
      const result = insertBrand.run(
        brand.name,
        brand.slug,
        brand.isActive ? 1 : 0,
        new Date().toISOString(),
        new Date().toISOString()
      );
      
      brandMap.set(brand.slug, result.lastInsertRowid);
      console.log(`✅ Added brand: ${brand.name}`);
    }
    
    // Seed products
    console.log('\n🛍️ Seeding products...');
    db.prepare('DELETE FROM products').run();
    console.log('🗑️ Cleared existing products');
    
    const insertProduct = db.prepare(`
      INSERT INTO products (
        category_id, brand_id, name, slug, description, images, 
        price, is_active, is_featured, on_sale, has_variations, 
        has_volume, volume, stock, unlimited_stock, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const product of mockProducts) {
      const categoryId = categoryMap.get(product.categorySlug);
      const brandId = brandMap.get(product.brandSlug);
      
      if (!categoryId || !brandId) {
        console.warn(`⚠️ Skipping product ${product.name} due to missing category or brand`);
        continue;
      }
      
      // Find matching blog post to use its body as product description if needed
      let description = product.description;
      if (description === 'Linked to blog post with the same slug') {
        const matchingBlogPost = mockBlogPosts.find(post => post.slug === product.slug);
        if (matchingBlogPost) {
          description = matchingBlogPost.body;
          console.log(`ℹ️ Using blog post body as description for product: ${product.name}`);
        }
      }
      
      insertProduct.run(
        categoryId,
        brandId,
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
      insertBlogPost.run(
        post.title,
        post.slug,
        post.body,
        post.images,
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
    
    console.log('\n🎉 Database seeded successfully!');
    
    // Close the database connection
    db.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase(); 