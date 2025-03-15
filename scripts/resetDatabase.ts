#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
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

console.log(`${colors.cyan}🧹 Starting ${isRemote ? 'remote' : 'local'} database reset process...${colors.reset}`);

// Function to safely delete a directory using shell commands
function safeDeleteDir(dirPath: string, description: string): boolean {
  try {
    if (fs.existsSync(dirPath)) {
      console.log(`${colors.yellow}Deleting ${description} at: ${dirPath}${colors.reset}`);
      
      // Use shell command to force delete the directory
      execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
      
      // Verify deletion was successful
      if (!fs.existsSync(dirPath)) {
        console.log(`${colors.green}✅ Successfully deleted ${description}${colors.reset}`);
        return true;
      } else {
        console.error(`${colors.red}❌ Failed to delete ${description}${colors.reset}`);
        return false;
      }
    } else {
      console.log(`${colors.blue}ℹ️ ${description} not found at: ${dirPath}${colors.reset}`);
      return true; // Not an error if directory doesn't exist
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`${colors.red}❌ Error deleting ${description}: ${error.message}${colors.reset}`);
    } else {
      console.error(`${colors.red}❌ Unknown error deleting ${description}${colors.reset}`);
    }
    return false;
  }
}

// Function to execute remote SQL commands with retries
async function executeRemoteSQL(command: string, description: string, maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`${colors.blue}Executing: ${description}${colors.reset}`);
      execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command="${command.replace(/"/g, '\\"')}"`, {
        stdio: 'inherit'
      });
      console.log(`${colors.green}✅ Successfully executed: ${description}${colors.reset}`);
      return true;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`${colors.red}❌ Failed to execute ${description} after ${maxRetries} attempts${colors.reset}`);
        return false;
      }
      console.log(`${colors.yellow}⚠️ Attempt ${attempt} failed, retrying...${colors.reset}`);
      // Wait for a short time before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return false;
}

async function resetDatabase() {
  let success = true;

  if (isRemote) {
    console.log(`${colors.cyan}📡 Resetting remote database...${colors.reset}`);
    
    // First, check if the database exists and is accessible
    try {
      await executeRemoteSQL('SELECT 1;', 'Testing database connection');
    } catch (error) {
      console.error(`${colors.red}❌ Cannot connect to database${colors.reset}`);
      process.exit(1);
    }

    // Disable foreign key checks first
    success = await executeRemoteSQL('PRAGMA foreign_keys = OFF;', 'Disabling foreign key constraints');
    
    // Order matters! Drop tables in reverse order of dependencies
    const tablesToDrop = [
      // First, drop tables with foreign keys (relationship tables first)
      'variation_attributes',
      'product_variations',
      'order_items',
      'addresses',
      'blog_tea_categories',
      'product_tea_categories',
      'blog_posts',
      'products',
      // Then drop tables that are referenced by others
      'orders',
      'users',
      'blog_categories',
      'tea_categories',
      'brands',
      'categories',
      'inquiries',
      // Finally, drop the migrations table
      'd1_migrations'
    ];

    // Drop each table individually with proper error handling
    for (const table of tablesToDrop) {
      // First check if table exists
      const tableExists = await executeRemoteSQL(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='${table}';`,
        `Checking if table ${table} exists`
      );

      if (tableExists) {
        // Drop the table
        const dropSuccess = await executeRemoteSQL(
          `DROP TABLE IF EXISTS ${table};`,
          `Dropping table ${table}`
        );
        
        if (!dropSuccess) {
          console.error(`${colors.red}❌ Failed to drop table ${table}${colors.reset}`);
          success = false;
          break;
        }
      }
    }

    // Re-enable foreign key checks
    success = await executeRemoteSQL('PRAGMA foreign_keys = ON;', 'Re-enabling foreign key constraints') && success;

    if (success) {
      console.log(`${colors.green}🎉 Remote database reset process completed!${colors.reset}`);
      console.log(`${colors.magenta}ℹ️ Next steps:${colors.reset}`);
      console.log(`${colors.magenta}1. Generate migrations (pnpm db:generate)${colors.reset}`);
      console.log(`${colors.magenta}2. Apply migrations to remote database (pnpm db:migrate:prod)${colors.reset}`);
      console.log(`${colors.magenta}3. Seed the database if needed (pnpm db:seed:prod)${colors.reset}`);
    } else {
      console.error(`${colors.red}❌ Database reset process failed${colors.reset}`);
      process.exit(1);
    }
  } else {
    // Local database reset logic
    const d1Path = path.resolve('./.wrangler/state/v3/d1');
    const drizzlePath = path.resolve('./drizzle');

    // Delete D1 directory
    const d1Deleted = safeDeleteDir(d1Path, 'D1 database directory');

    // Delete Drizzle directory
    const drizzleDeleted = safeDeleteDir(drizzlePath, 'Drizzle directory');

    success = d1Deleted && drizzleDeleted;

    if (success) {
      console.log(`${colors.green}🎉 Local database reset process completed!${colors.reset}`);
    } else {
      console.error(`${colors.red}❌ Local database reset process failed${colors.reset}`);
      process.exit(1);
    }
  }
}

resetDatabase(); 