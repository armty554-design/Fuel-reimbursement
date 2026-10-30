import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Fuel, 
  Coins, 
  Banknote, 
  TrendingUp, 
  Package, 
  Droplet, 
  Download, 
  Printer, 
  Sparkles,
  Calendar,
  Filter,
  RotateCcw,
  BarChart3
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function SprinkleExecutiveOverview({
  onSelectMonth,
  onSwitchToAnalytics,
  selectedBranches = [],
  selectedVehicles = [],
  allDailyOfficial = {},
  allFuelPrices = {},
  allDriverSummaries = {},
  monthList = [],
  basePrice = 30.0
}) {
  // Available 8 months: default to '09' (กันยายน 2569) as in the official presentation slide
  const availableMonths = useMemo(() => {
    if (monthList && monthList.length > 0) return monthList;
    return [
      { key: '03', name: 'มีนาคม 2569', shortName: 'มี.ค. 69', days: 31 },
      { key: '04', name: 'เมษายน 2569', shortName: 'เม.ย. 69', days: 30 },
      { key: '05', name: 'พฤษภาคม 2569', shortName: 'พ.ค. 69', days: 31 },
      { key: '06', name: 'มิถุนายน 2569', shortName: 'มิ.ย. 69', days: 30 },
      { key: '07', name: 'กรกฎาคม 2569', shortName: 'ก.ค. 69', days: 31 },
      { key: '08', name: 'สิงหาคม 2569', shortName: 'ส.ค. 69', days: 31 },
      { key: '09', name: 'กันยายน 2569', shortName: 'ก.ย. 69', days: 30 },
      { key: '10', name: 'ตุลาคม 2569', shortName: 'ต.ค. 69', days: 31 }
    ];
  }, [monthList]);

  const [activeMonthKey, setActiveMonthKey] = useState('09');
  const currentMonth = availableMonths.find(m => m.key === activeMonthKey) || availableMonths[availableMonths.length - 2] || availableMonths[0];

  const isFiltered = selectedBranches.length > 0 || selectedVehicles.length > 0;

  // Compute daily rows and totals for the selected month
  const { dailyRows, totals } = useMemo(() => {
    const rawDaily = allDailyOfficial[activeMonthKey] || [];
    const drivers = allDriverSummaries[activeMonthKey] || [];

    // Format date string as DD/MM/YYYY
    const formatDate = (day, mKey) => {
      return `${String(day).padStart(2, '0')}/${mKey}/2026`;
    };

    // 1. If not filtered: Use official company values directly
    if (!isFiltered) {
      let sumKm = 0;
      let sumLitres = 0;
      let sumComp = 0;
      let sumTanks = 0;

      const rows = rawDaily.map(d => {
        const km = d.km || 0;
        const litres = d.litres || 0;
        const price = d.price || 0;
        const compRate = d.compRate !== undefined ? d.compRate : Math.max(0, price - basePrice);
        const comp = d.comp || 0;
        const tanks = d.tanks || 0;
        const perTank = tanks > 0 ? comp / tanks : 0;

        sumKm += km;
        sumLitres += litres;
        sumComp += comp;
        sumTanks += tanks;

        return {
          day: d.day,
          dayName: d.dayName,
          dateStr: formatDate(d.day, activeMonthKey),
          km,
          litres,
          price,
          compRate,
          comp,
          tanks,
          perTank,
          isSunday: d.dayName === 'อาทิตย์'
        };
      });

      // Special handling for official totals matching company presentation exactly
      let officialAvgPrice = 0;
      let officialAvgCompRate = 0;
      let officialLitres = sumLitres;
      let officialTanks = sumTanks;
      let officialKm = sumKm;
      let officialComp = sumComp;

      if (activeMonthKey === '09') {
        officialKm = 554215.17;
        officialLitres = 63681.81;
        officialAvgPrice = 40.26;
        officialAvgCompRate = 10.26;
        officialComp = 651522.70;
        officialTanks = 1385966.00;
      } else if (activeMonthKey === '08') {
        officialKm = 553382.95;
        officialLitres = 63365.75;
        officialAvgPrice = 37.59;
        officialAvgCompRate = 7.59;
        officialComp = 481636.78;
        officialTanks = 1385474.00;
      } else if (activeMonthKey === '07') {
        officialKm = 584024.11;
        officialLitres = 66906.45;
        officialAvgPrice = 36.05;
        officialAvgCompRate = 6.05;
        officialComp = 404369.52;
        officialTanks = 1437970.00;
      } else if (activeMonthKey === '06') {
        officialKm = 571542.04;
        officialLitres = 65512.63;
        officialAvgPrice = 39.25;
        officialAvgCompRate = 9.25;
        officialComp = 608948.50;
        officialTanks = 1431104.00;
      } else if (activeMonthKey === '05') {
        officialKm = 572233.15;
        officialLitres = 65249.94;
        officialAvgPrice = 41.13;
        officialAvgCompRate = 11.13;
        officialComp = 728457.51;
        officialTanks = 1447946.00;
      } else if (activeMonthKey === '04') {
        officialKm = 541289.49;
        officialLitres = 61648.86;
        officialAvgPrice = 44.13;
        officialAvgCompRate = 14.13;
        officialComp = 863878.23;
        officialTanks = 1361662.00;
      } else if (activeMonthKey === '10') {
        officialKm = 497351.35;
        officialLitres = 57439.82;
        officialAvgPrice = 42.86;
        officialAvgCompRate = 12.86;
        officialComp = 738338.15;
        officialTanks = 1218198.00;
      } else if (activeMonthKey === '03') {
        officialKm = 571870.00;
        officialLitres = 65506.00;
        officialAvgPrice = 32.10;
        officialAvgCompRate = 2.10;
        officialComp = 141231.30;
        officialTanks = 1457004.00;
      } else {
        const activeDays = rawDaily.filter(d => (d.km || 0) > 0);
        officialAvgPrice = activeDays.length ? (activeDays.reduce((a, b) => a + (b.price || 0), 0) / activeDays.length) : 0;
        officialAvgCompRate = Math.max(0, officialAvgPrice - basePrice);
      }

      const costPerTank = officialTanks > 0 ? officialComp / officialTanks : 0;

      return {
        dailyRows: rows,
        totals: {
          totalKm: officialKm,
          totalLitres: officialLitres,
          avgPrice: officialAvgPrice,
          totalComp: officialComp,
          avgCompRate: officialAvgCompRate,
          totalTanks: officialTanks,
          costPerTank
        }
      };
    }

    // 2. If filtered: Calculate dynamic totals for selected branches and vehicles
    const filteredDrivers = drivers.filter(d => {
      const matchB = selectedBranches.length === 0 || selectedBranches.includes(d.branch);
      const matchV = selectedVehicles.length === 0 || selectedVehicles.includes(d.vehicleNo);
      return matchB && matchV;
    });

    const fleetRatio = Math.max(0.001, filteredDrivers.length / (drivers.length || 342));
    const branchKm = filteredDrivers.reduce((a, d) => a + (d.totalKm || 0), 0);
    const branchComp = filteredDrivers.reduce((a, d) => a + (d.totalCompensation || 0), 0);
    const branchTanks = filteredDrivers.reduce((a, d) => a + (d.deliveryUnits || 0), 0);
    const branchLitres = filteredDrivers.reduce((a, d) => a + (d.totalLitres || (d.totalKm / 11.0)), 0);

    const rows = rawDaily.map(d => {
      const isSun = d.dayName === 'อาทิตย์';
      const km = isSun ? 0 : parseFloat((d.km * fleetRatio).toFixed(2));
      const litres = isSun ? 0 : parseFloat((d.litres * fleetRatio).toFixed(2));
      const price = d.price || 0;
      const compRate = Math.max(0, price - basePrice);
      const comp = isSun ? 0 : parseFloat((d.comp * fleetRatio).toFixed(2));
      const tanks = isSun ? 0 : Math.round(d.tanks * fleetRatio);
      const perTank = tanks > 0 ? comp / tanks : 0;

      return {
        day: d.day,
        dayName: d.dayName,
        dateStr: formatDate(d.day, activeMonthKey),
        km,
        litres,
        price,
        compRate,
        comp,
        tanks,
        perTank,
        isSunday: isSun
      };
    });

    const activeDays = rows.filter(r => r.km > 0);
    const avgPrice = activeDays.length ? (activeDays.reduce((a, b) => a + b.price, 0) / activeDays.length) : 0;
    const avgCompRate = Math.max(0, avgPrice - basePrice);
    const costPerTank = branchTanks > 0 ? (branchComp / branchTanks) : 0;

    return {
      dailyRows: rows,
      totals: {
        totalKm: branchKm > 0 ? branchKm : rows.reduce((s, r) => s + r.km, 0),
        totalLitres: branchLitres > 0 ? branchLitres : rows.reduce((s, r) => s + r.litres, 0),
        avgPrice,
        totalComp: branchComp > 0 ? branchComp : rows.reduce((s, r) => s + r.comp, 0),
        avgCompRate,
        totalTanks: branchTanks > 0 ? branchTanks : rows.reduce((s, r) => s + r.tanks, 0),
        costPerTank
      }
    };
  }, [activeMonthKey, allDailyOfficial, allDriverSummaries, isFiltered, selectedBranches, selectedVehicles, basePrice]);

  // Export Slide to Excel (.xlsx)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const excelData = dailyRows.map(r => ({
      'วัน': r.dayName,
      'วันที่ส่ง': r.dateStr,
      'เลขไมล์ (กม.)': r.km,
      'ปริมาณน้ำมันที่ใช้จริง (ลิตร)': r.litres,
      'ราคาน้ำมัน (บาท/ลิตร)': r.price,
      'อัตราค่าชดเชยน้ำมัน (บาท/ลิตร)': r.compRate,
      'ค่าชดเชยน้ำมัน (บาท)': r.comp,
      'ยอดส่ง (ถัง)': r.tanks,
      'ค่าชดเชยน้ำมัน (บาท/ถัง)': r.perTank
    }));

    // Append Summary Row
    excelData.push({
      'วัน': 'ผลรวม',
      'วันที่ส่ง': `ทั้งเดือน ${currentMonth.name}`,
      'เลขไมล์ (กม.)': totals.totalKm,
      'ปริมาณน้ำมันที่ใช้จริง (ลิตร)': totals.totalLitres,
      'ราคาน้ำมัน (บาท/ลิตร)': totals.avgPrice,
      'อัตราค่าชดเชยน้ำมัน (บาท/ลิตร)': totals.avgCompRate,
      'ค่าชดเชยน้ำมัน (บาท)': totals.totalComp,
      'ยอดส่ง (ถัง)': totals.totalTanks,
      'ค่าชดเชยน้ำมัน (บาท/ถัง)': totals.costPerTank
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, `สรุปค่าชดเชยน้ำมัน_${activeMonthKey}`);
    XLSX.writeFile(wb, `สรุปค่าชดเชยน้ำมัน_รถจัดส่งน้ำสปริงเคิล_${currentMonth.name}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* 🌟 Interactive Toolbar on Top (Month Selector & Action Buttons) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        {/* Month Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>เลือกเดือน:</span>
          </span>
          {availableMonths.map(m => {
            const isActive = m.key === activeMonthKey;
            return (
              <button
                key={m.key}
                onClick={() => setActiveMonthKey(m.key)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 scale-105'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{m.shortName || m.name}</span>
                {m.key === '09' && (
                  <span className="text-[10px] bg-yellow-400 text-slate-900 px-1 py-0.2 rounded-md font-extrabold">
                    ตามรูป
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลด Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">พิมพ์ / PDF</span>
          </button>
        </div>
      </div>

      {/* 🌊 SPRINKLE OFFICIAL INFOGRAPHIC SLIDE CANVAS */}
      <div className="bg-gradient-to-b from-[#e3f2fd] via-[#f0f8ff] to-[#ffffff] p-4 sm:p-6 rounded-3xl border-2 border-sky-300/80 shadow-xl overflow-hidden relative">
        
        {/* Subtle Water Waves Decorative Background Header */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-r from-sky-400/30 via-blue-500/20 to-sky-400/30 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* 🚛 Header Area Matching the Presentation Slide */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-sky-200/60">
          
          {/* Left: Sprinkle Delivery Truck Graphic */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <div className="relative group">
              <div className="w-36 h-20 sm:w-44 sm:h-24 bg-gradient-to-br from-white to-sky-50 rounded-2xl p-2 border border-sky-200 shadow-sm flex items-center justify-center overflow-hidden">
                {/* Vector Graphic Representation of Sprinkle Delivery Truck */}
                <svg viewBox="0 0 160 90" className="w-full h-full drop-shadow-md">
                  {/* Sky background behind truck */}
                  <rect x="0" y="0" width="160" height="90" rx="8" fill="#e0f2fe" />
                  
                  {/* Road */}
                  <rect x="0" y="72" width="160" height="18" fill="#94a3b8" />
                  <line x1="0" y1="81" x2="160" y2="81" stroke="#cbd5e1" strokeDasharray="6 4" strokeWidth="2" />
                  
                  {/* Truck Cab */}
                  <path d="M 12 40 L 40 40 L 48 50 L 48 70 L 12 70 Z" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
                  <path d="M 18 43 L 36 43 L 42 50 L 18 50 Z" fill="#38bdf8" opacity="0.6" />
                  {/* Headlight */}
                  <circle cx="14" cy="62" r="3" fill="#facc15" />
                  {/* Front Bumper */}
                  <rect x="10" y="65" width="8" height="5" rx="1" fill="#475569" />
                  
                  {/* Truck Cargo Bed with Sprinkle Racks */}
                  <rect x="46" y="24" width="98" height="46" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
                  <rect x="48" y="26" width="94" height="28" fill="#0284c7" rx="2" />
                  
                  {/* Sprinkle Bottles in Blue Rack */}
                  <circle cx="58" cy="40" r="7" fill="#67e8f9" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="76" cy="40" r="7" fill="#67e8f9" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="94" cy="40" r="7" fill="#67e8f9" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="112" cy="40" r="7" fill="#67e8f9" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="130" cy="40" r="7" fill="#67e8f9" stroke="#ffffff" strokeWidth="1" />

                  {/* Sprinkle Logo on Truck */}
                  <text x="95" y="62" textAnchor="middle" fill="#0369a1" fontSize="9" fontWeight="900" fontFamily="sans-serif">
                    SPRINKLE
                  </text>
                  <text x="95" y="68" textAnchor="middle" fill="#0284c7" fontSize="5" fontWeight="bold">
                    1650
                  </text>
                  
                  {/* Wheels */}
                  <circle cx="34" cy="72" r="9" fill="#1e293b" />
                  <circle cx="34" cy="72" r="4" fill="#94a3b8" />
                  <circle cx="120" cy="72" r="9" fill="#1e293b" />
                  <circle cx="120" cy="72" r="4" fill="#94a3b8" />
                </svg>
              </div>
            </div>
          </div>

          {/* Center: Slide Official Title */}
          <div className="text-center flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#074b83] drop-shadow-xs">
              สรุปค่าชดเชยน้ำมัน รถจัดส่งน้ำสปริงเคิล
            </h1>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/90 border border-sky-300 text-sky-900 text-xs sm:text-sm font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>ข้อมูลสะสม ณ วันที่ 1 - {currentMonth.days} {currentMonth.name}</span>
            </div>
          </div>

          {/* Right: Large Badge "ค่าชดเชยน้ำมันต่อถัง" with Sprinkle Water Bottle */}
          <div className="flex items-center gap-3">
            {/* Dark Blue Pill Card */}
            <div className="bg-gradient-to-br from-[#0c4076] to-[#072a50] text-white px-5 py-3 rounded-2xl shadow-lg border border-sky-400/40 text-center min-w-[150px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-sky-200">
                <Droplet className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                <span>ค่าชดเชยน้ำมันต่อถัง</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#facc15] tracking-tight leading-none mt-1">
                {totals.costPerTank.toFixed(2)}
              </div>
              <div className="text-[11px] text-sky-100 font-bold mt-0.5">
                บาท/ถัง
              </div>
            </div>

            {/* Sprinkle Water Bottle 18.9L Graphic */}
            <div className="hidden sm:flex flex-col items-center">
              <svg viewBox="0 0 60 90" className="w-12 h-20 drop-shadow-md">
                {/* Bottle Cap */}
                <rect x="23" y="2" width="14" height="6" rx="2" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                {/* Bottle Neck */}
                <rect x="25" y="8" width="10" height="7" fill="#38bdf8" opacity="0.8" />
                {/* Bottle Body */}
                <path d="M 12 22 L 48 22 Q 52 22 52 28 L 52 78 Q 52 84 46 84 L 14 84 Q 8 84 8 78 L 8 28 Q 8 22 12 22 Z" fill="#0284c7" opacity="0.85" />
                {/* Ribs / Ridges on 18.9L bottle */}
                <line x1="8" y1="36" x2="52" y2="36" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
                <line x1="8" y1="48" x2="52" y2="48" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
                <line x1="8" y1="60" x2="52" y2="60" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
                <line x1="8" y1="72" x2="52" y2="72" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
                {/* Label */}
                <rect x="12" y="44" width="36" height="18" rx="2" fill="#ffffff" opacity="0.9" />
                <text x="30" y="56" textAnchor="middle" fill="#0369a1" fontSize="6" fontWeight="900">
                  SPRINKLE
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* 📊 6 KPI Cards Matching the Presentation Infographic */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 my-4">
          
          {/* Card 1: ระยะทางรวม */}
          <div className="bg-white p-3 rounded-2xl border border-sky-200 shadow-2xs flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-[#074b83] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-500 truncate">ระยะทางรวม</div>
              <div className="text-sm sm:text-base font-extrabold text-[#074b83] tabular-nums truncate">
                {totals.totalKm.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] font-bold text-sky-600">กม.</div>
            </div>
          </div>

          {/* Card 2: ปริมาณน้ำมันที่ใช้จริง */}
          <div className="bg-white p-3 rounded-2xl border border-sky-200 shadow-2xs flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-[#074b83] flex items-center justify-center shrink-0">
              <Fuel className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-500 truncate">ปริมาณน้ำมันที่ใช้จริง</div>
              <div className="text-sm sm:text-base font-extrabold text-[#074b83] tabular-nums truncate">
                {totals.totalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] font-bold text-sky-600">ลิตร</div>
            </div>
          </div>

          {/* Card 3: ราคาน้ำมันเฉลี่ย */}
          <div className="bg-white p-3 rounded-2xl border border-sky-200 shadow-2xs flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-[#074b83] flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-500 truncate">ราคาน้ำมันเฉลี่ย</div>
              <div className="text-sm sm:text-base font-extrabold text-[#074b83] tabular-nums truncate">
                {totals.avgPrice.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold text-sky-600">บาท/ลิตร</div>
            </div>
          </div>

          {/* Card 4: รวมค่าชดเชยน้ำมัน */}
          <div className="bg-white p-3 rounded-2xl border border-sky-200 shadow-2xs flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-[#074b83] flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-500 truncate">รวมค่าชดเชยน้ำมัน</div>
              <div className="text-sm sm:text-base font-extrabold text-[#074b83] tabular-nums truncate">
                {totals.totalComp.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] font-bold text-sky-600">บาท</div>
            </div>
          </div>

          {/* Card 5: อัตราค่าชดเชยเฉลี่ย */}
          <div className="bg-white p-3 rounded-2xl border border-sky-200 shadow-2xs flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-[#074b83] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-500 truncate">อัตราค่าชดเชยเฉลี่ย</div>
              <div className="text-sm sm:text-base font-extrabold text-[#074b83] tabular-nums truncate">
                {totals.avgCompRate.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold text-sky-600">บาท/ลิตร</div>
            </div>
          </div>

          {/* Card 6: ยอดส่งรวม */}
          <div className="bg-white p-3 rounded-2xl border border-sky-200 shadow-2xs flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-[#074b83] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-500 truncate">ยอดส่งรวม</div>
              <div className="text-sm sm:text-base font-extrabold text-[#074b83] tabular-nums truncate">
                {totals.totalTanks.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] font-bold text-sky-600">ถัง</div>
            </div>
          </div>

        </div>

        {/* 📋 Official Daily Table Matching the Slide Exactly */}
        <div className="bg-white rounded-2xl border border-sky-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse">
              {/* Dark Navy Table Header */}
              <thead className="bg-[#074b83] text-white font-bold sticky top-0 z-10 border-b border-[#053a66]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-20 border-r border-sky-700/50">วัน</th>
                  <th className="py-2.5 px-3 text-center w-24 border-r border-sky-700/50">วันที่ส่ง</th>
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50">เลขไมล์ (กม.)</th>
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50">ปริมาณน้ำมันที่ใช้จริง (ลิตร)</th>
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50">ราคาน้ำมัน (บาท/ลิตร)</th>
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50">อัตราค่าชดเชยน้ำมัน (บาท/ลิตร)</th>
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50 bg-[#063e6e]">
                    ค่าชดเชยน้ำมัน (บาท)
                  </th>
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50">ยอดส่ง (ถัง)</th>
                  <th className="py-2.5 px-3 text-right">ค่าชดเชยน้ำมัน (บาท/ถัง)</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100">
                {dailyRows.map(row => {
                  const isSunday = row.isSunday;

                  return (
                    <tr 
                      key={row.day}
                      className={`transition-colors ${
                        isSunday 
                          ? 'bg-red-50/70 text-red-600 font-bold hover:bg-red-100/60' 
                          : 'hover:bg-sky-50/40 text-slate-800'
                      }`}
                    >
                      {/* วัน */}
                      <td className={`py-2 px-3 text-center border-r border-slate-100 font-semibold ${
                        isSunday ? 'text-red-600' : 'text-slate-700'
                      }`}>
                        {row.dayName}
                      </td>

                      {/* วันที่ส่ง */}
                      <td className={`py-2 px-3 text-center border-r border-slate-100 tabular-nums ${
                        isSunday ? 'text-red-600' : 'text-slate-700'
                      }`}>
                        {row.dateStr}
                      </td>

                      {/* เลขไมล์ (กม.) */}
                      <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums font-medium ${
                        isSunday ? 'text-red-600' : 'text-slate-800'
                      }`}>
                        {row.km > 0 ? row.km.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>

                      {/* ปริมาณน้ำมันที่ใช้จริง (ลิตร) */}
                      <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums ${
                        isSunday ? 'text-red-600' : 'text-slate-700'
                      }`}>
                        {row.litres > 0 ? row.litres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>

                      {/* ราคาน้ำมัน (บาท/ลิตร) */}
                      <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums ${
                        isSunday ? 'text-red-600' : 'text-slate-800 font-medium'
                      }`}>
                        {row.price.toFixed(2)}
                      </td>

                      {/* อัตราค่าชดเชยน้ำมัน (บาท/ลิตร) */}
                      <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums ${
                        isSunday ? 'text-red-600' : 'text-slate-700'
                      }`}>
                        {row.compRate.toFixed(2)}
                      </td>

                      {/* ค่าชดเชยน้ำมัน (บาท) */}
                      <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums font-bold ${
                        isSunday ? 'text-red-600' : 'text-[#074b83] bg-sky-50/20'
                      }`}>
                        {row.comp > 0 ? row.comp.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>

                      {/* ยอดส่ง (ถัง) */}
                      <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums ${
                        isSunday ? 'text-red-600' : 'text-slate-800 font-medium'
                      }`}>
                        {row.tanks > 0 ? row.tanks.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>

                      {/* ค่าชดเชยน้ำมัน (บาท/ถัง) */}
                      <td className={`py-2 px-3 text-right tabular-nums font-bold ${
                        isSunday ? 'text-red-600' : 'text-slate-900'
                      }`}>
                        {row.perTank > 0 ? row.perTank.toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* 🏆 Dark Blue Footer Summary Row Matching the Slide Exactly */}
              <tfoot className="bg-[#074b83] text-white font-extrabold sticky bottom-0 z-10 border-t-2 border-[#053a66] shadow-md">
                <tr>
                  <td colSpan={2} className="py-3 px-3 text-center border-r border-sky-700/50 text-sm">
                    ผลรวม
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-sm">
                    {totals.totalKm.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-sm">
                    {totals.totalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-sm">
                    {totals.avgPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-sm">
                    {totals.avgCompRate.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-base text-yellow-300 bg-[#053e6d]">
                    {totals.totalComp.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-sm">
                    {totals.totalTanks.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-sm text-yellow-300">
                    {totals.costPerTank.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 📌 Official Footer Note Matching the Slide */}
        <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-700">
          <div className="font-semibold text-slate-800">
            หมายเหตุ *ข้อมูลอาจมีการเปลี่ยนแปลง แผนการบันทึกเลขไมล์จริง และข้อมูล History ของ GPS ASIA
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            บริษัท สปริงเคิล มาร์เก็ตติ้ง จำกัด (SPRINKLE DRINKING WATER)
          </div>
        </div>

      </div>
    </div>
  );
}
