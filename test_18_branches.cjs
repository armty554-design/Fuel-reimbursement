const seed = require('./src/data/seedData.json');
const branches = seed.branches;
const monthDefs = seed.monthList;

const branchYTD = {};
branches.forEach(b => {
  branchYTD[b.id] = { id: b.id, name: b.name, km: 0, comp: 0, tanks: 0, count: 0 };
});

monthDefs.forEach(m => {
  const drivers = seed.allDriverSummaries[m.key] || [];
  drivers.forEach(d => {
    const bId = d.branch || '10';
    if (branchYTD[bId]) {
      branchYTD[bId].km += d.totalKm || 0;
      branchYTD[bId].comp += d.totalCompensation || 0;
      branchYTD[bId].tanks += d.deliveryUnits || 0;
    }
  });
});

console.log('18 Branches YTD Summary:');
Object.values(branchYTD).sort((a,b) => b.comp - a.comp).forEach((b, i) => {
  console.log(`${i+1}. สาขา ${b.id} ${b.name}: ชดเชย ฿${Math.round(b.comp).toLocaleString()} | ระยะทาง ${Math.round(b.km).toLocaleString()} กม. | ยอดส่ง ${Math.round(b.tanks).toLocaleString()} ถัง`);
});
