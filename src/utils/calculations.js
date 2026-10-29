// Calculation engine for Fuel Compensation and Mileage Diff

export const SPECIAL_STATUSES = ['ไม่จด', 'NO', 'ลา', 'ไม่มีงาน', 'ไมล์เสีย'];

/**
 * คำนวณส่วนต่างระหว่าง CRM และ History
 * เปรียบเทียบ (CRM / History) = (CRM - History) / CRM * 100%
 */
export function calculateCompPercentage(crm, history) {
  if (!crm && crm !== 0) return '';
  if (!history && history !== 0) return '';

  const c = parseFloat(crm);
  const h = parseFloat(history);

  if (isNaN(c) || isNaN(h)) return '';
  if (c === 0) return h === 0 ? '0%' : '-100%';

  const diffPct = ((c - h) / c) * 100;
  return `${Math.round(diffPct)}%`;
}

/**
 * คำนวณเลขไมล์ DIFF. + 10%
 * กฎเกณฑ์:
 * 1. ถ้ามีสถานะพิเศษ (ไม่จด, NO, ลา, ไม่มีงาน, ไมล์เสีย) ให้คงสถานะนั้นไว้
 * 2. ถ้ามีการตั้งค่านโยบายบังคับ (overridePolicy):
 *    - 'history' -> ยึด History
 *    - 'crm' -> ยึด CRM
 * 3. ถ้าผลต่างสัมบูรณ์ |CRM - History| / CRM <= 10% (คลาดเคลื่อนไม่เกิน +/- 10%)
 *    -> ให้ใช้ค่า History (GPS)
 *    -> ถ้าเกิน 10% ให้ตัดกลับไปใช้ค่า CRM
 * 4. ถ้ามีค่าใดค่าหนึ่งว่าง ให้ใช้ค่าที่มีอยู่
 */
export function calculateDiffPlusTen(crm, history, overridePolicy = 'auto') {
  const crmStr = String(crm || '').trim();
  const histStr = String(history || '').trim();

  // ตรวจสอบสถานะข้อความพิเศษ
  if (SPECIAL_STATUSES.includes(crmStr)) return crmStr;
  if (SPECIAL_STATUSES.includes(histStr)) return histStr;

  const c = parseFloat(crmStr);
  const h = parseFloat(histStr);

  const isCrmValid = !isNaN(c);
  const isHistValid = !isNaN(h);

  if (!isCrmValid && !isHistValid) return '';
  if (isCrmValid && !isHistValid) return c.toFixed(1);
  if (!isCrmValid && isHistValid) return h.toFixed(1);

  // นโยบายพิเศษระดับบุคคล/รถ
  if (overridePolicy === 'history') return h.toFixed(1);
  if (overridePolicy === 'crm') return c.toFixed(1);

  if (c === 0) return '0.0';

  // ตรวจสอบส่วนต่าง 10%
  const diffRatio = Math.abs((c - h) / c);
  if (diffRatio <= 0.10001) {
    // ภายใน 10% ยึด History (GPS)
    return h.toFixed(1);
  } else {
    // เกิน 10% ตัดกลับมาใช้ CRM
    return c.toFixed(1);
  }
}

/**
 * คำนวณเงินชดเชยน้ำมันรายวัน
 * @param {number|string} mileage - เลขไมล์ DIFF. + 10%
 * @param {number} dieselPrice - ราคาน้ำมันดีเซลวันนั้น (บาท/ลิตร)
 * @param {number} basePrice - ราคาน้ำมันฐาน (ค่าเริ่มต้น 30.00 บาท/ลิตร)
 * @param {number} fuelConsumption - อัตรากินน้ำมัน (ค่าเริ่มต้น 11 กม./ลิตร)
 */
export function calculateDailyCompensation(mileage, dieselPrice, basePrice = 30.0, fuelConsumption = 11.0) {
  const m = parseFloat(mileage);
  const price = parseFloat(dieselPrice);
  const base = parseFloat(basePrice) || 30.0;
  const kmPerLitre = parseFloat(fuelConsumption) || 11.0;

  if (isNaN(m) || m <= 0 || isNaN(price) || price <= base) {
    return {
      litresUsed: 0,
      compRatePerLitre: Math.max(0, (price || 0) - base),
      compensationAmount: 0,
      actualCost: 0
    };
  }

  const compRatePerLitre = Math.max(0, price - base);
  const litresUsed = m / kmPerLitre;
  const compensationAmount = litresUsed * compRatePerLitre;
  const actualCost = litresUsed * price;

  return {
    litresUsed: parseFloat(litresUsed.toFixed(2)),
    compRatePerLitre: parseFloat(compRatePerLitre.toFixed(2)),
    compensationAmount: parseFloat(compensationAmount.toFixed(2)),
    actualCost: parseFloat(actualCost.toFixed(2))
  };
}
