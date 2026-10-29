const fs = require('fs');

const seed = JSON.parse(fs.readFileSync('./src/data/seedData.json', 'utf8'));

console.log('=== MULTI-MONTH VERIFICATION REPORT ===');
console.log(`Loaded ${seed.monthList.length} months:`);

seed.monthList.forEach(m => {
  const mKey = m.key;
  const officialDaily = seed.allDailyOfficial[mKey] || [];
  const drivers = seed.allDriverSummaries[mKey] || [];
  const prices = seed.allFuelPrices[mKey] || {};

  const totalKmDaily = officialDaily.reduce((acc, d) => acc + (d.km || 0), 0);
  const totalCompDaily = officialDaily.reduce((acc, d) => acc + (d.comp || 0), 0);
  const totalTanksDaily = officialDaily.reduce((acc, d) => acc + (d.tanks || 0), 0);

  const totalKmDrivers = drivers.reduce((acc, d) => acc + (d.totalKm || 0), 0);
  const totalCompDrivers = drivers.reduce((acc, d) => acc + (d.totalCompensation || 0), 0);

  console.log(`\n📅 ${m.name} (${mKey}):`);
  console.log(`  - วันในเดือน: ${m.days} วัน`);
  console.log(`  - จำนวนผู้ขับ/รถ: ${drivers.length} คัน`);
  console.log(`  - รวมระยะทาง (กม.): ${totalKmDaily.toLocaleString('th-TH', { minimumFractionDigits: 1 })}`);
  console.log(`  - รวมค่าชดเชย (บาท): ฿${totalCompDaily.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`);
  console.log(`  - รวมยอดส่ง (ถัง): ${totalTanksDaily.toLocaleString('th-TH')} ถัง`);
  console.log(`  - ค่าชดเชยเฉลี่ย/ถัง: ฿${totalTanksDaily > 0 ? (totalCompDaily / totalTanksDaily).toFixed(2) : '-'} /ถัง`);
});
