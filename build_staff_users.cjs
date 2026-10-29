const fs = require('fs');

function parseCsv(content) {
  const lines = content.split('\n');
  return lines.map(line => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else cur += c;
    }
    result.push(cur.trim());
    return result;
  });
}

const OFFICIAL_BRANCHES = [
  { id: '10', name: 'บางพลี' },
  { id: '11', name: 'สุขุมวิท 50' },
  { id: '12', name: 'วังน้อย' },
  { id: '13', name: 'รามอินทรา' },
  { id: '14', name: 'ราษฎร์บูรณะ' },
  { id: '15', name: 'สำโรง' },
  { id: '16', name: 'กรุงเทพกรีฑา' },
  { id: '17', name: 'บางบัวทอง' },
  { id: '18', name: 'ประชาชื่น' },
  { id: '20', name: 'พระราม 2' },
  { id: '30', name: 'ปทุมธานี' },
  { id: '40', name: 'บุคคโล' },
  { id: '50', name: 'พระราม 3' },
  { id: '60', name: 'ปากเกร็ด' },
  { id: '70', name: 'กิ่งแก้ว' },
  { id: '80', name: 'พุทธมณฑลสาย 1' },
  { id: '90', name: 'ประเวศ' },
  { id: '98', name: 'ดอนเมือง' }
];

const nameToId = new Map(OFFICIAL_BRANCHES.map(b => [b.name, b.id]));

const rows = parseCsv(fs.readFileSync('contractors.csv', 'utf8'));
const staffUsers = [];

for (let i = 2; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[1] || isNaN(parseInt(r[1]))) continue;

  const empId = r[1].trim();
  const zone = r[3].trim();
  let branchName = r[4].trim();
  if (branchName.includes('ประเวศ')) branchName = 'ประเวศ';

  const prefixTitle = r[5].trim();
  const firstName = r[6].trim();
  const lastName = r[7].trim();
  const position = r[8].trim();
  const startDate = r[9] ? r[9].trim() : '';

  // Determine role:
  // Admin: กรรมการบริหาร, ผู้อำนวยการ, ผู้จัดการแผนก, ผู้ช่วยผู้อำนวยการ, รองผู้อำนวยการ
  // Manager: ผู้จัดการสาขา, ผู้จัดการเขต
  // Officer: หัวหน้าโลจิสติกส์, หัวหน้าธุรการ, เจ้าหน้าที่ธุรการ
  let role = 'officer';
  const highAdminKeywords = ['กรรมการ', 'ผู้อำนวยการ', 'ผู้จัดการแผนก', 'ผู้จัดการสำนักงาน'];
  const managerKeywords = ['ผู้จัดการสาขา', 'ผู้จัดการเขต'];

  if (highAdminKeywords.some(k => position.includes(k))) {
    role = 'admin';
  } else if (managerKeywords.some(k => position.includes(k))) {
    role = 'manager';
  }

  const branchId = nameToId.get(branchName) || (role === 'admin' ? 'all' : '10');

  staffUsers.push({
    empId,
    username: empId,
    fullName: `${prefixTitle}${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    position,
    role, // 'admin' | 'manager' | 'officer'
    branch: branchId,
    branchName: branchName || 'สำนักงานใหญ่',
    zone
  });
}

console.log(`Extracted ${staffUsers.length} staff login users!`);

// Update seedData.json with staffUsers
const seedData = JSON.parse(fs.readFileSync('./src/data/seedData.json', 'utf8'));
seedData.staffUsers = staffUsers;
fs.writeFileSync('./src/data/seedData.json', JSON.stringify(seedData, null, 2), 'utf8');
console.log('Successfully added staffUsers to src/data/seedData.json');
