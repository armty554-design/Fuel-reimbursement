const fs = require('fs');

const seed = JSON.parse(fs.readFileSync('./src/data/seedData.json', 'utf8'));
console.log('Branches in seedData:');
console.log(seed.branches);

const driverBranchCounts = {};
seed.drivers.forEach(d => {
  const key = `${d.branch} - ${d.branchName}`;
  driverBranchCounts[key] = (driverBranchCounts[key] || 0) + 1;
});
console.log('\nDrivers count by (branch - branchName):');
console.log(driverBranchCounts);
