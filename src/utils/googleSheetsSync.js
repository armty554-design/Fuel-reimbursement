/**
 * Google Sheets Real-time Live Sync Utility
 * Directly pulls the latest live data from Google Sheets with zero caching.
 */

export const SPREADSHEET_ID = '1EBABef97HhkgSBbh4thuiJ8Twey8pKvsWJuJlaf1ws8';

// Configuration for all months in Google Sheets
export const SHEET_CONFIG = {
  '01': {
    name: 'มกราคม 2569',
    compGid: '1705387900',   // ค่าชดเชย 1
    diffGid: '2144916075',   // เลขไมล์ Diff 1
    tanksGid: '1580669641',  // ยอดส่ง 1
    detailGid: '277935568'   // รายละเอียดชดเชยน้ำมัน ม.ค.
  },
  '03': { name: 'มีนาคม 2569', compGid: '1372603448', diffGid: '1766239945' },
  '04': { name: 'เมษายน 2569', compGid: '148629339', diffGid: '2074752255' },
  '05': { name: 'พฤษภาคม 2569', compGid: '448001912', diffGid: '1427241011' },
  '06': { name: 'มิถุนายน 2569', compGid: '403366828', diffGid: '1862188402' },
  '07': { name: 'กรกฎาคม 2569', compGid: '845798235', diffGid: '445467613' },
  '08': { name: 'สิงหาคม 2569', compGid: '1565238636', diffGid: '1456535403' },
  '09': { name: 'กันยายน 2569', compGid: '771609346', diffGid: '582576194' },
  '10': {
    name: 'ตุลาคม 2569',
    compGid: '1923881986',   // ค่าชดเชย 10
    diffGid: '1173352041',   // เลขไมล์ Diff 10
    tanksGid: '375387489',   // ยอดส่ง 10
    detailGid: '29931557'    // รายละเอียดชดเชยน้ำมัน ต.ค.
  }
};

/**
 * Fast RFC 4180 compliant CSV parser
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(cur.trim());
      cur = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(cur.trim());
      cur = '';
      if (row.length > 1) rows.push(row);
      row = [];
    } else {
      cur += c;
    }
  }
  if (cur.length || row.length) {
    row.push(cur.trim());
    if (row.length > 1) rows.push(row);
  }
  return rows;
}

export function cleanNum(val) {
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Build CSV export URL with cache-busting timestamp
 */
export function getExportUrl(gid) {
  const timestamp = Date.now();
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}&_t=${timestamp}`;
}

/**
 * Fetch and parse daily compensation data from Google Sheets for a specific month
 */
export async function fetchLiveDailyComp(monthKey, basePrice = 30.0) {
  const cfg = SHEET_CONFIG[monthKey];
  if (!cfg || !cfg.compGid) return null;

  const url = getExportUrl(cfg.compGid);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });

  if (!res.ok) {
    throw new Error(`Google Sheets fetch failed: ${res.status} ${res.statusText}`);
  }

  const csvText = await res.text();
  const rows = parseCsv(csvText);

  const daily = [];
  const prices = {};
  let summary = null;

  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[1]) continue;

    // Detect summary row
    if (row[0].includes('ผลรวม') || row[1].includes('ผลรวม')) {
      summary = {
        totalKm: cleanNum(row[2]),
        totalLitres: cleanNum(row[3]),
        avgPrice: cleanNum(row[4]),
        avgCompRate: cleanNum(row[5]),
        totalComp: cleanNum(row[6]),
        totalTanks: cleanNum(row[7]),
        costPerTank: cleanNum(row[8])
      };
      continue;
    }

    const dayName = row[0];
    const dateStr = row[1];
    const parts = dateStr.split('/');
    const day = parseInt(parts[0], 10);
    if (!day) continue;

    const km = cleanNum(row[2]);
    const litres = cleanNum(row[3]);
    const price = cleanNum(row[4]);
    const compRate = cleanNum(row[5]) || Math.max(0, price - basePrice);
    const comp = cleanNum(row[6]);
    const tanks = cleanNum(row[7]);
    const perTank = cleanNum(row[8]);

    prices[day] = price;
    daily.push({
      day,
      dayName,
      dateStr,
      km,
      litres,
      price,
      compRate,
      comp,
      tanks,
      perTank,
      isSunday: dayName === 'อาทิตย์'
    });
  }

  // If summary row was not found, calculate from daily rows
  if (!summary && daily.length > 0) {
    const totalKm = daily.reduce((s, r) => s + r.km, 0);
    const totalLitres = daily.reduce((s, r) => s + r.litres, 0);
    const totalComp = daily.reduce((s, r) => s + r.comp, 0);
    const totalTanks = daily.reduce((s, r) => s + r.tanks, 0);
    const activeDays = daily.filter(r => r.km > 0 && r.price > 0);
    const avgPrice = activeDays.length ? (activeDays.reduce((s, r) => s + r.price, 0) / activeDays.length) : 0;
    const avgCompRate = Math.max(0, avgPrice - basePrice);
    const costPerTank = totalTanks > 0 ? totalComp / totalTanks : 0;

    summary = {
      totalKm,
      totalLitres,
      avgPrice,
      avgCompRate,
      totalComp,
      totalTanks,
      costPerTank
    };
  }

  return {
    monthKey,
    daily,
    prices,
    summary,
    timestamp: Date.now()
  };
}

/**
 * Fetch and parse driver Diff summary data for a specific month
 */
export async function fetchLiveDriverDiff(monthKey) {
  const cfg = SHEET_CONFIG[monthKey];
  if (!cfg || !cfg.diffGid) return null;

  const url = getExportUrl(cfg.diffGid);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });

  if (!res.ok) {
    throw new Error(`Google Sheets diff fetch failed: ${res.status}`);
  }

  const csvText = await res.text();
  const rows = parseCsv(csvText);

  const drivers = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[1] || isNaN(parseInt(row[1], 10))) continue;
    const empId = row[1].trim();
    const vehicleNo = row[2] ? row[2].trim() : '';
    const firstName = row[3] ? row[3].trim() : '';
    const lastName = row[4] ? row[4].trim() : '';
    const diffType = row[9] ? row[9].trim() : '';
    if (diffType !== 'DIFF. + 10%') continue;

    const totalKm = cleanNum(row[41]);
    const workingDays = cleanNum(row[42]);
    const vehicleType = row[44] ? row[44].trim() : 'กระบะ 4 ล้อ';
    const fuelConsumption = cleanNum(row[45]) || 11.0;
    const totalLitres = cleanNum(row[46]);
    const totalCompensation = cleanNum(row[47]);
    const branchName = row[67] ? row[67].trim() : '';
    const deliveryUnits = cleanNum(row[7]) || cleanNum(row[69]) || 0;
    const compPerTank = deliveryUnits > 0 ? totalCompensation / deliveryUnits : 0;
    const branchId = vehicleNo.length >= 2 ? vehicleNo.substring(0, 2) : '10';

    drivers.push({
      empId,
      vehicleNo,
      fullName: `${firstName} ${lastName}`.trim(),
      branch: branchId,
      branchName,
      vehicleType,
      fuelConsumption,
      workingDays,
      totalKm,
      totalLitres,
      totalCompensation,
      deliveryUnits,
      compPerTank: parseFloat(compPerTank.toFixed(2))
    });
  }

  return {
    monthKey,
    drivers,
    timestamp: Date.now()
  };
}
