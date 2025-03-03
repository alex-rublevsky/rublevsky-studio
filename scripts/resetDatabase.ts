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

console.log(`${colors.cyan}🧹 Starting database reset process...${colors.reset}`);

// Paths to clean
const d1Path = path.resolve('./.wrangler/state/v3/d1');
const drizzlePath = path.resolve('./drizzle');

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

// Delete D1 directory
const d1Deleted = safeDeleteDir(d1Path, 'D1 database directory');

// Delete Drizzle directory
const drizzleDeleted = safeDeleteDir(drizzlePath, 'Drizzle directory');

// Report results
if (d1Deleted && drizzleDeleted) {
  console.log(`${colors.green}🎉 Database reset process completed successfully!${colors.reset}`);
  console.log(`${colors.magenta}ℹ️ Next steps will run automatically:${colors.reset}`);
  console.log(`${colors.magenta}ℹ️ 1. Generate migrations (pnpm db:generate)${colors.reset}`);
  console.log(`${colors.magenta}ℹ️ 2. Apply migrations (pnpm db:migrate:local)${colors.reset}`);
  console.log(`${colors.magenta}ℹ️ After that completes, you can seed the database with: pnpm db:seed${colors.reset}`);
} else {
  console.error(`${colors.red}❌ Database reset process failed${colors.reset}`);
  process.exit(1);
} 