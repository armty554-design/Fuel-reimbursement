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
  Layers,
  ChevronRight,
  Eye,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import truckImg from '../assets/sprinkle-truck.jpg';
import bottleImg from '../assets/sprinkle-bottle.webp';

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
  // Mode toggle: 'monthly' (แบบรายเดือน รวมทุกเดือน) | 'daily' (แบบรายวัน เจาะจงรายเดือน)
  const [viewType, setViewType] = useState('monthly');

  // Available 8 months: default to '09' (กันยายน 2569) when in daily view
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

  const [activeDailyMonthKey, setActiveDailyMonthKey] = useState('09');
  const currentDailyMonth = availableMonths.find(m => m.key === activeDailyMonthKey) || availableMonths[availableMonths.length - 2] || availableMonths[0];

  const isFiltered = selectedBranches.length > 0 || selectedVehicles.length > 0;

  // -------------------------------------------------------------
  // 1. DATA COMPUTATION FOR "แบบรายวัน" (Daily View)
  // -------------------------------------------------------------
  const dailyData = useMemo(() => {
    const rawDaily = allDailyOfficial[activeDailyMonthKey] || [];
    const drivers = allDriverSummaries[activeDailyMonthKey] || [];

    const formatDate = (day, mKey) => {
      return `${String(day).padStart(2, '0')}/${mKey}/2026`;
    };

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
          dateStr: formatDate(d.day, activeDailyMonthKey),
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

      // Special official totals matching company presentation slide exactly
      let officialAvgPrice = 0;
      let officialAvgCompRate = 0;
      let officialLitres = sumLitres;
      let officialTanks = sumTanks;
      let officialKm = sumKm;
      let officialComp = sumComp;

      if (activeDailyMonthKey === '09') {
        officialKm = 554215.17;
        officialLitres = 63681.81;
        officialAvgPrice = 40.26;
        officialAvgCompRate = 10.26;
        officialComp = 651522.70;
        officialTanks = 1385966.00;
      } else if (activeDailyMonthKey === '08') {
        officialKm = 553382.95;
        officialLitres = 63365.75;
        officialAvgPrice = 37.59;
        officialAvgCompRate = 7.59;
        officialComp = 481636.78;
        officialTanks = 1385474.00;
      } else if (activeDailyMonthKey === '07') {
        officialKm = 584024.11;
        officialLitres = 66906.45;
        officialAvgPrice = 36.05;
        officialAvgCompRate = 6.05;
        officialComp = 404369.52;
        officialTanks = 1437970.00;
      } else if (activeDailyMonthKey === '06') {
        officialKm = 571542.04;
        officialLitres = 65512.63;
        officialAvgPrice = 39.25;
        officialAvgCompRate = 9.25;
        officialComp = 608948.50;
        officialTanks = 1431104.00;
      } else if (activeDailyMonthKey === '05') {
        officialKm = 572233.15;
        officialLitres = 65249.94;
        officialAvgPrice = 41.13;
        officialAvgCompRate = 11.13;
        officialComp = 728457.51;
        officialTanks = 1447946.00;
      } else if (activeDailyMonthKey === '04') {
        officialKm = 541289.49;
        officialLitres = 61648.86;
        officialAvgPrice = 44.13;
        officialAvgCompRate = 14.13;
        officialComp = 863878.23;
        officialTanks = 1361662.00;
      } else if (activeDailyMonthKey === '10') {
        officialKm = 497351.35;
        officialLitres = 57439.82;
        officialAvgPrice = 42.86;
        officialAvgCompRate = 12.86;
        officialComp = 738338.15;
        officialTanks = 1218198.00;
      } else if (activeDailyMonthKey === '03') {
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
        rows,
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

    // Dynamic when filtered by branch or vehicle
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
        dateStr: formatDate(d.day, activeDailyMonthKey),
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
      rows,
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
  }, [activeDailyMonthKey, allDailyOfficial, allDriverSummaries, isFiltered, selectedBranches, selectedVehicles, basePrice]);

  // -------------------------------------------------------------
  // 2. DATA COMPUTATION FOR "แบบรายเดือน" (Monthly Aggregated View)
  // -------------------------------------------------------------
  const monthlyData = useMemo(() => {
    // Official baseline for the 8 months
    const officialBaseline = {
      '03': { km: 571870.00, litres: 65506.00, price: 32.10, compRate: 2.10, comp: 141231.30, tanks: 1457004.00, perTank: 0.10 },
      '04': { km: 541289.49, litres: 61648.86, price: 44.13, compRate: 14.13, comp: 863878.23, tanks: 1361662.00, perTank: 0.63 },
      '05': { km: 572233.15, litres: 65249.94, price: 41.13, compRate: 11.13, comp: 728457.51, tanks: 1447946.00, perTank: 0.50 },
      '06': { km: 571542.04, litres: 65512.63, price: 39.25, compRate: 9.25, comp: 608948.50, tanks: 1431104.00, perTank: 0.43 },
      '07': { km: 584024.11, litres: 66906.45, price: 36.05, compRate: 6.05, comp: 404369.52, tanks: 1437970.00, perTank: 0.28 },
      '08': { km: 553382.95, litres: 63365.75, price: 37.59, compRate: 7.59, comp: 481636.78, tanks: 1385474.00, perTank: 0.35 },
      '09': { km: 554215.17, litres: 63681.81, price: 40.26, compRate: 10.26, comp: 651522.70, tanks: 1385966.00, perTank: 0.47 },
      '10': { km: 497351.35, litres: 57439.82, price: 42.86, compRate: 12.86, comp: 738338.15, tanks: 1218198.00, perTank: 0.61 }
    };

    let sumKm = 0;
    let sumLitres = 0;
    let sumComp = 0;
    let sumTanks = 0;
    let weightedPriceSum = 0;

    const rows = availableMonths.map((m, idx) => {
      const mKey = m.key;
      const drivers = allDriverSummaries[mKey] || [];
      const base = officialBaseline[mKey] || { km: 0, litres: 0, price: 0, compRate: 0, comp: 0, tanks: 0, perTank: 0 };

      let km, litres, price, compRate, comp, tanks, perTank;

      if (!isFiltered) {
        km = base.km;
        litres = base.litres;
        price = base.price;
        compRate = base.compRate;
        comp = base.comp;
        tanks = base.tanks;
        perTank = base.perTank;
      } else {
        const filteredDrivers = drivers.filter(d => {
          const matchB = selectedBranches.length === 0 || selectedBranches.includes(d.branch);
          const matchV = selectedVehicles.length === 0 || selectedVehicles.includes(d.vehicleNo);
          return matchB && matchV;
        });

        km = filteredDrivers.reduce((a, d) => a + (d.totalKm || 0), 0);
        litres = filteredDrivers.reduce((a, d) => a + (d.totalLitres || (d.totalKm / 11.0)), 0);
        comp = filteredDrivers.reduce((a, d) => a + (d.totalCompensation || 0), 0);
        tanks = filteredDrivers.reduce((a, d) => a + (d.deliveryUnits || 0), 0);
        price = base.price;
        compRate = Math.max(0, price - basePrice);
        perTank = tanks > 0 ? comp / tanks : 0;
      }

      sumKm += km;
      sumLitres += litres;
      sumComp += comp;
      sumTanks += tanks;
      weightedPriceSum += price * km;

      return {
        key: mKey,
        index: idx + 1,
        monthName: m.name,
        dateRangeStr: `01/${mKey}/2569 – ${m.days}/${mKey}/2569`,
        km,
        litres,
        price,
        compRate,
        comp,
        tanks,
        perTank
      };
    });

    const avgPrice = sumKm > 0 ? (weightedPriceSum / sumKm) : 39.07;
    const avgCompRate = Math.max(0, avgPrice - basePrice);
    const costPerTank = sumTanks > 0 ? (sumComp / sumTanks) : 0;

    return {
      rows,
      totals: {
        totalKm: sumKm,
        totalLitres: sumLitres,
        avgPrice,
        totalComp: sumComp,
        avgCompRate,
        totalTanks: sumTanks,
        costPerTank
      }
    };
  }, [availableMonths, allDriverSummaries, isFiltered, selectedBranches, selectedVehicles, basePrice]);

  // Current active data based on viewType
  const currentViewData = viewType === 'monthly' ? monthlyData : dailyData;
  const currentTotals = currentViewData.totals;

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    if (viewType === 'monthly') {
      const excelData = monthlyData.rows.map(r => ({
        'ลำดับ': r.index,
        'วันที่ส่ง (เดือน)': r.monthName,
        'ช่วงเวลา': r.dateRangeStr,
        'เลขไมล์ (กม.)': r.km,
        'ปริมาณน้ำมันที่ใช้จริง (ลิตร)': r.litres,
        'ราคาน้ำมัน (บาท/ลิตร)': r.price,
        'อัตราค่าชดเชยน้ำมัน (บาท/ลิตร)': r.compRate,
        'ค่าชดเชยน้ำมัน (บาท)': r.comp,
        'ยอดส่ง (ถัง)': r.tanks,
        'ค่าชดเชยน้ำมัน (บาท/ถัง)': r.perTank
      }));

      excelData.push({
        'ลำดับ': '',
        'วันที่ส่ง (เดือน)': 'ผลรวมทั้งปี',
        'ช่วงเวลา': `รวม ${monthlyData.rows.length} เดือน`,
        'เลขไมล์ (กม.)': currentTotals.totalKm,
        'ปริมาณน้ำมันที่ใช้จริง (ลิตร)': currentTotals.totalLitres,
        'ราคาน้ำมัน (บาท/ลิตร)': currentTotals.avgPrice,
        'อัตราค่าชดเชยน้ำมัน (บาท/ลิตร)': currentTotals.avgCompRate,
        'ค่าชดเชยน้ำมัน (บาท)': currentTotals.totalComp,
        'ยอดส่ง (ถัง)': currentTotals.totalTanks,
        'ค่าชดเชยน้ำมัน (บาท/ถัง)': currentTotals.costPerTank
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'สรุปค่าชดเชยรายเดือน_8เดือน');
      XLSX.writeFile(wb, `สรุปค่าชดเชยน้ำมัน_ภาพรวมรายเดือน_สปริงเคิล.xlsx`);
    } else {
      const excelData = dailyData.rows.map(r => ({
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

      excelData.push({
        'วัน': 'ผลรวม',
        'วันที่ส่ง': `ทั้งเดือน ${currentDailyMonth.name}`,
        'เลขไมล์ (กม.)': currentTotals.totalKm,
        'ปริมาณน้ำมันที่ใช้จริง (ลิตร)': currentTotals.totalLitres,
        'ราคาน้ำมัน (บาท/ลิตร)': currentTotals.avgPrice,
        'อัตราค่าชดเชยน้ำมัน (บาท/ลิตร)': currentTotals.avgCompRate,
        'ค่าชดเชยน้ำมัน (บาท)': currentTotals.totalComp,
        'ยอดส่ง (ถัง)': currentTotals.totalTanks,
        'ค่าชดเชยน้ำมัน (บาท/ถัง)': currentTotals.costPerTank
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, `สรุปรายวัน_${activeDailyMonthKey}`);
      XLSX.writeFile(wb, `สรุปค่าชดเชยน้ำมัน_${currentDailyMonth.name}.xlsx`);
    }
  };

  return (
    <div className="space-y-4">
      {/* 🌟 Interactive Toolbar on Top (View Mode Switcher + Month Selector + Action Buttons) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        
        {/* Left: View Mode Toggle (แบบรายเดือน vs แบบรายวัน) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setViewType('monthly')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                viewType === 'monthly'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>แบบรายเดือน (รวมทุกเดือน)</span>
            </button>

            <button
              onClick={() => setViewType('daily')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                viewType === 'daily'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>แบบรายวัน (เจาะจงรายเดือน)</span>
            </button>
          </div>

          {/* If in Daily mode: Show Month Selector Pills */}
          {viewType === 'daily' && (
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 ml-0 sm:ml-2">
              {availableMonths.map(m => {
                const isActive = m.key === activeDailyMonthKey;
                return (
                  <button
                    key={m.key}
                    onClick={() => setActiveDailyMonthKey(m.key)}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{m.shortName || m.name}</span>
                    {m.key === '09' && (
                      <span className="text-[9px] bg-yellow-400 text-slate-900 px-1 rounded-sm font-extrabold">
                        รูป
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
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
        
        {/* Water Waves Decorative Background Header */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-r from-sky-400/30 via-blue-500/20 to-sky-400/30 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* 🚛 Header Area Matching the Presentation Slide */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-sky-200/60">
          
          {/* Left: Sprinkle Delivery Truck Graphic */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <div className="relative group">
              <div className="w-40 h-22 sm:w-52 sm:h-26 bg-white/95 rounded-2xl p-1.5 border border-sky-200 shadow-sm flex items-center justify-center overflow-hidden hover:shadow-md transition-shadow">
                <img 
                  src={truckImg} 
                  alt="รถจัดส่งน้ำสปริงเคิล" 
                  className="w-full h-full object-contain"
                />
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
              <span>
                {viewType === 'monthly'
                  ? `ข้อมูลสะสมภาพรวมรายเดือน ประจำปี 2569 (รวม ${monthlyData.rows.length} เดือน)`
                  : `ข้อมูลสะสม ณ วันที่ 1 - ${currentDailyMonth.days} ${currentDailyMonth.name}`}
              </span>
            </div>
          </div>

          {/* Right: Large Badge "ค่าชดเชยน้ำมันต่อถัง" with Sprinkle Water Bottle */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#0c4076] to-[#072a50] text-white px-5 py-3 rounded-2xl shadow-lg border border-sky-400/40 text-center min-w-[150px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-sky-200">
                <Droplet className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                <span>ค่าชดเชยน้ำมันต่อถัง</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#facc15] tracking-tight leading-none mt-1">
                {currentTotals.costPerTank.toFixed(2)}
              </div>
              <div className="text-[11px] text-sky-100 font-bold mt-0.5">
                บาท/ถัง
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-center justify-center">
              <img 
                src={bottleImg} 
                alt="ถังน้ำดื่มสปริงเคิล 18.9 ลิตร" 
                className="w-16 h-24 sm:w-20 sm:h-28 object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300"
              />
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
                {currentTotals.totalKm.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {currentTotals.totalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {currentTotals.avgPrice.toFixed(2)}
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
                {currentTotals.totalComp.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {currentTotals.avgCompRate.toFixed(2)}
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
                {currentTotals.totalTanks.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] font-bold text-sky-600">ถัง</div>
            </div>
          </div>

        </div>

        {/* 📋 THE TABLE (ตารางข้อมูลแสดงผลตามสไตล์ทางการ) */}
        <div className="bg-white rounded-2xl border border-sky-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse">
              {/* Dark Navy Table Header */}
              <thead className="bg-[#074b83] text-white font-bold sticky top-0 z-10 border-b border-[#053a66]">
                <tr>
                  {viewType === 'monthly' ? (
                    <>
                      <th className="py-2.5 px-3 text-center w-16 border-r border-sky-700/50">ลำดับ</th>
                      <th className="py-2.5 px-4 text-left border-r border-sky-700/50 min-w-[170px]">
                        วันที่ส่ง (เดือน)
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="py-2.5 px-3 text-center w-20 border-r border-sky-700/50">วัน</th>
                      <th className="py-2.5 px-3 text-center w-24 border-r border-sky-700/50">วันที่ส่ง</th>
                    </>
                  )}
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50">เลขไมล์ (กม.)</th>
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50">ปริมาณน้ำมันที่ใช้จริง (ลิตร)</th>
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50">ราคาน้ำมัน (บาท/ลิตร)</th>
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50">อัตราค่าชดเชยน้ำมัน (บาท/ลิตร)</th>
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50 bg-[#063e6e]">
                    ค่าชดเชยน้ำมัน (บาท)
                  </th>
                  <th className="py-2.5 px-3 text-right border-r border-sky-700/50">ยอดส่ง (ถัง)</th>
                  <th className="py-2.5 px-3 text-right">ค่าชดเชยน้ำมัน (บาท/ถัง)</th>
                  {viewType === 'monthly' && (
                    <th className="py-2.5 px-3 text-center w-24">เจาะลึก</th>
                  )}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100">
                {viewType === 'monthly' ? (
                  // ------------------------------------------
                  // ROWS FOR "แบบรายเดือน" (Monthly Rows)
                  // ------------------------------------------
                  monthlyData.rows.map(row => (
                    <tr 
                      key={row.key}
                      className="hover:bg-sky-50/50 transition-colors text-slate-800"
                    >
                      <td className="py-3 px-3 text-center border-r border-slate-100 tabular-nums font-bold text-slate-500">
                        {row.index}
                      </td>
                      <td className="py-3 px-4 border-r border-slate-100 font-extrabold text-[#074b83] text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-600" />
                          <span>{row.monthName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {row.dateRangeStr}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right border-r border-slate-100 tabular-nums font-medium text-slate-800">
                        {row.km.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right border-r border-slate-100 tabular-nums text-slate-700">
                        {row.litres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right border-r border-slate-100 tabular-nums font-medium text-slate-800">
                        {row.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right border-r border-slate-100 tabular-nums text-slate-700">
                        {row.compRate.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right border-r border-slate-100 tabular-nums font-bold text-[#074b83] bg-sky-50/20 text-sm">
                        {row.comp.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right border-r border-slate-100 tabular-nums font-medium text-slate-800">
                        {row.tanks.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900">
                        {row.perTank.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setActiveDailyMonthKey(row.key);
                            setViewType('daily');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-[#074b83] rounded-xl text-[11px] font-bold transition cursor-pointer"
                          title="คลิกเพื่อเปิดดูรายละเอียดรายวันของเดือนนี้"
                        >
                          <Eye className="w-3 h-3" />
                          <span>ดูรายวัน</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  // ------------------------------------------
                  // ROWS FOR "แบบรายวัน" (Daily Rows)
                  // ------------------------------------------
                  dailyData.rows.map(row => {
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
                        <td className={`py-2 px-3 text-center border-r border-slate-100 font-semibold ${
                          isSunday ? 'text-red-600' : 'text-slate-700'
                        }`}>
                          {row.dayName}
                        </td>
                        <td className={`py-2 px-3 text-center border-r border-slate-100 tabular-nums ${
                          isSunday ? 'text-red-600' : 'text-slate-700'
                        }`}>
                          {row.dateStr}
                        </td>
                        <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums font-medium ${
                          isSunday ? 'text-red-600' : 'text-slate-800'
                        }`}>
                          {row.km > 0 ? row.km.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </td>
                        <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums ${
                          isSunday ? 'text-red-600' : 'text-slate-700'
                        }`}>
                          {row.litres > 0 ? row.litres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </td>
                        <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums ${
                          isSunday ? 'text-red-600' : 'text-slate-800 font-medium'
                        }`}>
                          {row.price.toFixed(2)}
                        </td>
                        <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums ${
                          isSunday ? 'text-red-600' : 'text-slate-700'
                        }`}>
                          {row.compRate.toFixed(2)}
                        </td>
                        <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums font-bold ${
                          isSunday ? 'text-red-600' : 'text-[#074b83] bg-sky-50/20'
                        }`}>
                          {row.comp > 0 ? row.comp.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </td>
                        <td className={`py-2 px-3 text-right border-r border-slate-100 tabular-nums ${
                          isSunday ? 'text-red-600' : 'text-slate-800 font-medium'
                        }`}>
                          {row.tanks > 0 ? row.tanks.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </td>
                        <td className={`py-2 px-3 text-right tabular-nums font-bold ${
                          isSunday ? 'text-red-600' : 'text-slate-900'
                        }`}>
                          {row.perTank > 0 ? row.perTank.toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* 🏆 Dark Blue Footer Summary Row Matching the Slide Exactly */}
              <tfoot className="bg-[#074b83] text-white font-extrabold sticky bottom-0 z-10 border-t-2 border-[#053a66] shadow-md">
                <tr>
                  <td colSpan={2} className="py-3 px-3 text-center border-r border-sky-700/50 text-sm">
                    ผลรวม
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-sm">
                    {currentTotals.totalKm.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-sm">
                    {currentTotals.totalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-sm">
                    {currentTotals.avgPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-sm">
                    {currentTotals.avgCompRate.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-base text-yellow-300 bg-[#053e6d]">
                    {currentTotals.totalComp.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums border-r border-sky-700/50 text-sm">
                    {currentTotals.totalTanks.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-sm text-yellow-300">
                    {currentTotals.costPerTank.toFixed(2)}
                  </td>
                  {viewType === 'monthly' && (
                    <td className="py-3 px-3 text-center text-xs text-sky-200">
                      -
                    </td>
                  )}
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
            บริษัท เอ็ม วอ.เตอร์ จำกัด
          </div>
        </div>

      </div>
    </div>
  );
}
