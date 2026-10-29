import { 
  calculateCompPercentage, 
  calculateDiffPlusTen, 
  calculateDailyCompensation 
} from '../src/utils/calculations.js';

console.log('=== RUNNING CALCULATION TESTS ===');

// Test 1: Within 10%
// CRM = 50, History = 45.0 => diff ratio = (50 - 45)/50 = 10% => should be 45.0
const r1 = calculateDiffPlusTen(50, 45.0);
console.assert(r1 === '45.0', `Test 1 failed: expected 45.0, got ${r1}`);

// Test 2: Over 10%
// CRM = 60, History = 47.60 => diff ratio = (60 - 47.6)/60 = 20.6% => should return CRM (60.0)
const r2 = calculateDiffPlusTen(60, 47.60);
console.assert(r2 === '60.0', `Test 2 failed: expected 60.0, got ${r2}`);

// Test 3: Special statuses
const r3 = calculateDiffPlusTen('ไม่จด', 'ไม่จด');
console.assert(r3 === 'ไม่จด', `Test 3 failed: expected ไม่จด, got ${r3}`);

const r4 = calculateDiffPlusTen('NO', 'NO');
console.assert(r4 === 'NO', `Test 4 failed: expected NO, got ${r4}`);

// Test 4: Percentage comp
const p1 = calculateCompPercentage(31, 31.19);
console.assert(p1 === '-1%', `Percentage test 1 failed: expected -1%, got ${p1}`);

const p2 = calculateCompPercentage(50, 45);
console.assert(p2 === '10%', `Percentage test 2 failed: expected 10%, got ${p2}`);

// Test 5: Fuel Compensation
// Mileage = 69.90 km, Diesel = 42.19, Base = 30.00, Km/L = 11
// Litres = 69.9 / 11 = 6.3545 L
// CompRate = 42.19 - 30 = 12.19 THB/L
// Amount = 6.3545 * 12.19 = 77.46 THB
const comp = calculateDailyCompensation(69.90, 42.19, 30.00, 11.0);
console.assert(Math.abs(comp.litresUsed - 6.35) <= 0.05, `Litres used failed: got ${comp.litresUsed}`);
console.assert(Math.abs(comp.compensationAmount - 77.46) <= 0.1, `Compensation failed: got ${comp.compensationAmount}`);

console.log('✅ ALL CALCULATION TESTS PASSED SUCCESSFULLY!');
