/**
 * Master Sync Script for Fuel Reimbursement System
 * Fetches the latest data directly from the official Google Sheets:
 *  - Sheet 1: Input Daily Trip Records (19Mf5jnes2u5Z3IXz0vZyq1teHnmw0kHFzzDICHGP02k)
 *  - Sheet 2: Monthly Summary & Diesel Prices & DIFF (1EBABef97HhkgSBbh4thuiJ8Twey8pKvsWJuJlaf1ws8)
 *  - Sheet 3: Contractors & Staff Login Users (1DDE_KjfxmuSY_AtLdEd__0ruvU9FbGJSVQxNQWaTmf8)
 */

const { execSync } = require('child_process');

console.log('====================================================');
console.log('🚀 STARTING FULL SYNCHRONIZATION FROM GOOGLE SHEETS');
console.log('====================================================\n');

try {
  // Step 1: Fetch and update contractors
  console.log('Step 1/4: Fetching Contractors & Operators from Google Sheet...');
  execSync('node sync_contractors.cjs', { stdio: 'inherit' });

  // Step 2: Extract staff login users
  console.log('\nStep 2/4: Updating Staff Users from Google Sheet...');
  execSync('node build_staff_users.cjs', { stdio: 'inherit' });

  // Step 3: Fetch all months summary & diff sheets (03 to 10)
  console.log('\nStep 3/4: Fetching Monthly Compensation & DIFF Sheets (March - October)...');
  execSync('node fetch_all_months.cjs', { stdio: 'inherit' });

  // Step 4: Build full multi-month database
  console.log('\nStep 4/4: Compiling Multi-Month Database & SeedData...');
  execSync('node build_full_multi_month_database.cjs', { stdio: 'inherit' });

  console.log('\n====================================================');
  console.log('✅ SYNCHRONIZATION COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Sync failed:', error.message);
  process.exit(1);
}
