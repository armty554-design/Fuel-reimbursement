import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Users, 
  Droplet, 
  Download, 
  Printer, 
  Fuel,
  ChevronRight,
  CheckCircle2,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  SPRINKLE_MONTHS, 
  SPRINKLE_OFFICIAL_DATA_9_MONTHS 
} from '../data/sprinkleExecutiveData';

export default function SprinkleExecutiveOverview({ 
  onSelectMonth, 
  onSwitchToAnalytics,
  selectedBranches = [],
  selectedVehicles = [],
  allDriverSummaries = {},
  monthList = []
}) {
  const [includeOctober, setIncludeOctober] = useState(false);
  const isFiltered = selectedBranches.length > 0 || selectedVehicles.length > 0;
  const rawData = SPRINKLE_OFFICIAL_DATA_9_MONTHS;

  const activeMonths = includeOctober 
    ? SPRINKLE_MONTHS 
    : SPRINKLE_MONTHS.slice(0, 9);

  // Compute dynamic data when filtered by branch or vehicle
  const displayData = useMemo(() => {
    if (!isFiltered) {
      return rawData;
    }

    // Dynamic calculation for months 03-10
    const distanceVals = [];
    const membersVals = [];
    const tanksVals = [];
    const tanksPerCustVals = [];
    const metersPerTankVals = [];
    const fuelCompBahtVals = [];
    const fuelCompPerTankVals = [];

    // Scale ratio for historic Jan & Feb before detailed driver sheets
    const octDrivers = allDriverSummaries['10'] || [];
    const matchedCount = octDrivers.filter(d => {
      const matchB = selectedBranches.length === 0 || selectedBranches.includes(d.branch);
      const matchV = selectedVehicles.length === 0 || selectedVehicles.includes(d.vehicleNo);
      return matchB && matchV;
    }).length;
    const ratio = Math.max(0.01, matchedCount / (octDrivers.length || 342));

    activeMonths.forEach((m, idx) => {
      const mKey = m.id;
      const drivers = allDriverSummaries[mKey] || [];

      if (drivers.length > 0) {
        const filteredDrivers = drivers.filter(d => {
          const matchB = selectedBranches.length === 0 || selectedBranches.includes(d.branch);
          const matchV = selectedVehicles.length === 0 || selectedVehicles.includes(d.vehicleNo);
          return matchB && matchV;
        });

        const km = Math.round(filteredDrivers.reduce((a, d) => a + (d.totalKm || 0), 0));
        const tanks = Math.round(filteredDrivers.reduce((a, d) => a + (d.deliveryUnits || 0), 0));
        const comp = Math.round(filteredDrivers.reduce((a, d) => a + (d.totalCompensation || 0), 0));
        const compPerTank = tanks > 0 ? parseFloat((comp / tanks).toFixed(2)) : 0;
        const members = Math.round((rawData.deliveryData.rows[1].values[idx] || 125000) * ratio);
        const perCust = tanks > 0 && members > 0 ? Math.round(tanks / members) : 11;
        const metersPerTank = tanks > 0 ? Math.round((km * 1000) / tanks) : 399;

        distanceVals.push(km);
        membersVals.push(members);
        tanksVals.push(tanks);
        tanksPerCustVals.push(perCust);
        metersPerTankVals.push(metersPerTank);
        fuelCompBahtVals.push(comp);
        fuelCompPerTankVals.push(compPerTank);
      } else {
        // Fallback for Jan & Feb (proportional estimation)
        const origKm = rawData.deliveryData.rows[0].values[idx] || 0;
        const origMembers = rawData.deliveryData.rows[1].values[idx] || 0;
        const origTanks = rawData.deliveryData.rows[2].values[idx] || 0;
        const origFuel = rawData.fuelData.rows[0].values[idx] || 0;

        const km = Math.round(origKm * ratio);
        const members = Math.round(origMembers * ratio);
        const tanks = Math.round(origTanks * ratio);
        const comp = Math.round(origFuel * ratio);
        const compPerTank = tanks > 0 ? parseFloat((comp / tanks).toFixed(2)) : 0;

        distanceVals.push(km);
        membersVals.push(members);
        tanksVals.push(tanks);
        tanksPerCustVals.push(10);
        metersPerTankVals.push(400);
        fuelCompBahtVals.push(comp);
        fuelCompPerTankVals.push(compPerTank);
      }
    });

    const sumKm = distanceVals.reduce((a, b) => a + b, 0);
    const sumMembers = membersVals.reduce((a, b) => a + b, 0);
    const sumTanks = tanksVals.reduce((a, b) => a + b, 0);
    const sumFuel = fuelCompBahtVals.reduce((a, b) => a + b, 0);
    const avgCompPerTank = sumTanks > 0 ? parseFloat((sumFuel / sumTanks).toFixed(2)) : 0;
    const avgMeters = sumTanks > 0 ? Math.round((sumKm * 1000) / sumTanks) : 399;

    return {
      kpi: {
        distanceKm: sumKm,
        members: sumMembers,
        deliveredTanks: sumTanks,
        fuelCompensationBaht: sumFuel
      },
      deliveryData: {
        title: 'ข้อมูลการจัดส่ง',
        icon: 'truck',
        rows: [
          { id: 'distance', label: 'ระยะทาง (กม.)', type: 'int', values: distanceVals, total: sumKm },
          { id: 'members', label: 'จำนวนสมาชิก (ราย)', type: 'int', values: membersVals, total: sumMembers },
          { id: 'deliveredTanks', label: 'ยอดส่ง (ถัง)', type: 'int', values: tanksVals, total: sumTanks },
          { id: 'tanksPerCustomer', label: 'การรับน้ำ (เฉลี่ยราย/ถัง)', type: 'int', values: tanksPerCustVals, total: 11 },
          { id: 'metersPerTank', label: 'ระยะทาง (เฉลี่ย เมตร/ถัง)', type: 'int', values: metersPerTankVals, total: avgMeters }
        ]
      },
      fuelData: {
        title: 'ข้อมูลค่าชดเชยน้ำมัน',
        icon: 'fuel',
        rows: [
          { id: 'fuelCompBaht', label: 'ค่าชดเชยน้ำมัน (บาท)', type: 'int', isHighlight: true, values: fuelCompBahtVals, total: sumFuel },
          { id: 'fuelCompPerTank', label: 'ค่าชดเชยน้ำมัน (บาท/ถัง)', type: 'decimal', isHighlight: true, values: fuelCompPerTankVals, total: avgCompPerTank }
        ]
      }
    };
  }, [rawData, isFiltered, selectedBranches, selectedVehicles, allDriverSummaries, activeMonths]);

  // Formatters
  const formatInt = (val) => val != null ? Number(val).toLocaleString('th-TH') : '-';
  const formatDec = (val) => val != null ? Number(val).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows = [];

    // Header
    rows.push(['SPRINKLE DRINKING WATER - สรุปค่าชดเชยน้ำมัน']);
    rows.push([`ภาพรวมรายเดือน มกราคม – ${includeOctober ? 'ตุลาคม' : 'กันยายน'}`]);
    if (isFiltered) {
      rows.push([`ตัวกรอง: สาขา (${selectedBranches.join(', ') || 'ทุกสาขา'}) | เบอร์รถ (${selectedVehicles.join(', ') || 'ทุกคัน'})`]);
    }
    rows.push([]);

    // Table Header
    const headers = ['ข้อมูล/รายการ', ...activeMonths.map(m => m.shortName), 'รวม'];
    rows.push(headers);

    // Section 1: ข้อมูลการจัดส่ง
    rows.push([`🚚 ${displayData.deliveryData.title}`]);
    displayData.deliveryData.rows.forEach(r => {
      const vals = activeMonths.map((m, idx) => {
        if (isFiltered) return r.values[idx];
        return idx < 9 ? r.values[idx] : r.october;
      });
      const total = (!isFiltered && includeOctober) ? (r.total + (r.october || 0)) : r.total;
      rows.push([r.label, ...vals, total]);
    });

    // Section 2: ข้อมูลค่าชดเชยน้ำมัน
    rows.push([]);
    rows.push([`⛽ ${displayData.fuelData.title}`]);
    displayData.fuelData.rows.forEach(r => {
      const vals = activeMonths.map((m, idx) => {
        if (isFiltered) return r.values[idx];
        return idx < 9 ? r.values[idx] : r.october;
      });
      const total = (!isFiltered && includeOctober) ? (r.total + (r.october || 0)) : r.total;
      rows.push([r.label, ...vals, total]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'สรุปค่าชดเชยน้ำมัน');
    XLSX.writeFile(wb, `สรุปค่าชดเชยน้ำมัน_ภาพรวมรายเดือน.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        {/* Filter badge if active */}
        {isFiltered ? (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-200 px-3.5 py-1.5 rounded-2xl text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>กำลังแสดงผลตามตัวกรองที่เลือก</span>
            {selectedBranches.length > 0 && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[10px]">{selectedBranches.length} สาขา</span>}
            {selectedVehicles.length > 0 && <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-[10px]">{selectedVehicles.length} คัน</span>}
          </div>
        ) : <div />}

        <div className="flex items-center gap-2">
          {/* Toggle October */}
          <button
            onClick={() => setIncludeOctober(!includeOctober)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
              includeOctober 
                ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-xs' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${includeOctober ? 'text-sky-600' : 'text-slate-400'}`} />
            <span>{includeOctober ? 'แสดงรวม ต.ค. (10 เดือน)' : 'ม.ค. – ก.ย. (9 เดือน ตามสไลด์)'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-slate-900/20 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์ / PDF</span>
          </button>
        </div>
      </div>

      {/* 🌊 MAIN SPRINKLE EXECUTIVE INFOGRAPHIC BOARD 🌊 */}
      <div 
        id="sprinkle-infographic-board"
        className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-sky-100 print:border-none print:shadow-none"
        style={{
          background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 15%, #ffffff 85%, #e0f2fe 100%)'
        }}
      >
        
        {/* Top Decorative Water Wave Splash Banner */}
        <div className="w-full h-16 sm:h-20 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-300 relative overflow-hidden flex items-end">
          <svg className="w-full h-8 text-white/30 fill-current preserve-3d" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,30 L1200,120 L0,120 Z"></path>
          </svg>
          <svg className="w-full h-10 absolute bottom-0 text-white fill-current preserve-3d" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,30 C200,100 450,10 600,60 C750,110 1000,20 1200,50 L1200,120 L0,120 Z"></path>
          </svg>
        </div>

        <div className="p-6 sm:p-10 relative z-10 space-y-8">
          
          {/* Header Section: Logo, Title, Slogan, Truck */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-sky-100">
            
            {/* Left: Sprinkle Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                  <Droplet className="w-7 h-7 fill-white/90 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-sky-300 rounded-full blur-[2px] opacity-75" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black tracking-widest text-[#003B73] font-serif">
                  SPRINKLE
                </span>
                <span className="text-[10px] sm:text-xs tracking-[0.28em] text-sky-600 font-bold -mt-1">
                  DRINKING WATER
                </span>
              </div>
            </div>

            {/* Center: Main Title */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#003B73] tracking-tight">
                สรุปค่าชดเชยน้ำมัน
              </h1>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="h-[2px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-sky-400" />
                <span className="text-xs sm:text-base font-bold text-sky-700 tracking-wide">
                  ภาพรวมรายเดือน มกราคม – {includeOctober ? 'ตุลาคม' : 'กันยายน'}
                </span>
                <div className="h-[2px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-sky-400" />
              </div>
            </div>

            {/* Right: Slogan & Sprinkle Truck */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block text-sky-800 text-lg sm:text-xl font-bold italic tracking-wide" style={{ fontFamily: 'cursive' }}>
                  สะอาด...
                </span>
                <span className="block text-[#003B73] text-sm sm:text-base font-extrabold tracking-wide" style={{ fontFamily: 'cursive' }}>
                  ส่งถึงคุณ
                </span>
              </div>
              
              {/* Sprinkle Delivery Truck Graphic */}
              <div className="relative bg-gradient-to-tr from-sky-50 to-blue-100 p-2.5 rounded-2xl border border-sky-200 shadow-sm">
                <div className="w-16 h-10 flex items-center justify-center">
                  <div className="relative">
                    <Truck className="w-12 h-8 text-[#003B73]" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-sky-500 rounded-full flex items-center justify-center text-[7px] font-black text-white">
                      S
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* 4 TOP HIGH-LEVEL KPI PILL CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Distance */}
            <div className="bg-gradient-to-r from-white to-sky-50/60 p-4 sm:p-5 rounded-3xl border-2 border-sky-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-md shadow-sky-500/25 shrink-0">
                <svg className="w-7 h-7 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-5 0-5-4 0-4s5-4 0-4-5-4 0-4 5-4 0-4" />
                </svg>
              </div>
              <div>
                <span className="block text-xs font-bold text-sky-900/70">
                  ระยะทาง (กม.)
                </span>
                <span className="block text-2xl sm:text-3xl font-black text-[#003B73] tabular-nums tracking-tight">
                  {formatInt((!isFiltered && includeOctober) ? (displayData.kpi.distanceKm + rawData.deliveryData.rows[0].october) : displayData.kpi.distanceKm)}
                </span>
              </div>
            </div>

            {/* KPI 2: Members */}
            <div className="bg-gradient-to-r from-white to-sky-50/60 p-4 sm:p-5 rounded-3xl border-2 border-sky-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0096c7] to-[#48cae4] flex items-center justify-center text-white shadow-md shadow-cyan-500/25 shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <span className="block text-xs font-bold text-sky-900/70">
                  จำนวนสมาชิก (ราย)
                </span>
                <span className="block text-2xl sm:text-3xl font-black text-[#003B73] tabular-nums tracking-tight">
                  {formatInt((!isFiltered && includeOctober) ? (displayData.kpi.members + rawData.deliveryData.rows[1].october) : displayData.kpi.members)}
                </span>
              </div>
            </div>

            {/* KPI 3: Delivered Tanks */}
            <div className="bg-gradient-to-r from-white to-sky-50/60 p-4 sm:p-5 rounded-3xl border-2 border-sky-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0077b6] to-[#00b4d8] flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
                <div className="flex items-center gap-0.5">
                  <Droplet className="w-5 h-5 fill-white text-white" />
                  <Droplet className="w-4 h-4 fill-white/80 text-white -ml-1.5 mt-1" />
                </div>
              </div>
              <div>
                <span className="block text-xs font-bold text-sky-900/70">
                  ยอดส่ง (ถัง)
                </span>
                <span className="block text-2xl sm:text-3xl font-black text-[#003B73] tabular-nums tracking-tight">
                  {formatInt((!isFiltered && includeOctober) ? (displayData.kpi.deliveredTanks + rawData.deliveryData.rows[2].october) : displayData.kpi.deliveredTanks)}
                </span>
              </div>
            </div>

            {/* KPI 4: Total Fuel Compensation */}
            <div className="bg-gradient-to-r from-white to-sky-50/60 p-4 sm:p-5 rounded-3xl border-2 border-sky-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#023e8a] to-[#0077b6] flex items-center justify-center text-white shadow-md shadow-blue-800/25 shrink-0">
                <Fuel className="w-7 h-7" />
              </div>
              <div>
                <span className="block text-xs font-bold text-sky-900/70">
                  ค่าชดเชยน้ำมัน (บาท)
                </span>
                <span className="block text-2xl sm:text-3xl font-black text-[#003B73] tabular-nums tracking-tight">
                  {formatInt((!isFiltered && includeOctober) ? (displayData.kpi.fuelCompensationBaht + rawData.fuelData.rows[0].october) : displayData.kpi.fuelCompensationBaht)}
                </span>
              </div>
            </div>

          </div>

          {/* MASTER EXECUTIVE DATA TABLE */}
          <div className="overflow-x-auto rounded-2xl border-2 border-[#005f8d] shadow-lg bg-white">
            <table className="w-full text-xs border-collapse">
              
              {/* Table Column Headers */}
              <thead>
                <tr className="bg-[#004e7c] text-white">
                  <th className="py-3.5 px-4 text-left font-bold text-sm tracking-wide border-r border-[#006096] w-64">
                    ข้อมูล/รายการ
                  </th>
                  {activeMonths.map((m) => (
                    <th 
                      key={m.id} 
                      onClick={() => onSelectMonth && onSelectMonth(m.id)}
                      className="py-3.5 px-2.5 text-center font-bold text-sm border-r border-[#006096] hover:bg-[#003d61] cursor-pointer transition"
                      title={`คลิกเพื่อดูรายละเอียดสรุปเดือน ${m.name}`}
                    >
                      {m.shortName}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-center font-black text-sm bg-[#006d9e] border-l border-[#005a82]">
                    รวม
                  </th>
                </tr>
              </thead>

              <tbody>
                
                {/* 🚚 GROUP 1: ข้อมูลการจัดส่ง */}
                <tr className="bg-[#0284c7] text-white font-bold text-xs">
                  <td colSpan={activeMonths.length + 2} className="py-2 px-4 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm tracking-wide">{displayData.deliveryData.title}</span>
                  </td>
                </tr>

                {displayData.deliveryData.rows.map((row, rIdx) => {
                  const total = (!isFiltered && includeOctober) ? (row.total + (row.october || 0)) : row.total;
                  return (
                    <tr 
                      key={row.id} 
                      className={`border-b border-sky-100 hover:bg-sky-50/50 transition ${
                        rIdx % 2 === 1 ? 'bg-sky-50/20' : 'bg-white'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-800 border-r border-sky-100">
                        {row.label}
                      </td>
                      {activeMonths.map((m, mIdx) => {
                        const val = isFiltered ? row.values[mIdx] : (mIdx < 9 ? row.values[mIdx] : row.october);
                        return (
                          <td 
                            key={m.id} 
                            onClick={() => onSelectMonth && onSelectMonth(m.id)}
                            className="py-2.5 px-2.5 text-center tabular-nums text-slate-800 font-medium border-r border-sky-100 hover:bg-sky-100/60 cursor-pointer"
                          >
                            {row.type === 'decimal' ? formatDec(val) : formatInt(val)}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-4 text-center tabular-nums font-bold text-[#003B73] bg-sky-50/80 border-l border-sky-200">
                        {row.type === 'decimal' ? formatDec(total) : formatInt(total)}
                      </td>
                    </tr>
                  );
                })}

                {/* ⛽ GROUP 2: ข้อมูลค่าชดเชยน้ำมัน */}
                <tr className="bg-[#0284c7] text-white font-bold text-xs">
                  <td colSpan={activeMonths.length + 2} className="py-2 px-4 flex items-center gap-2">
                    <Fuel className="w-4 h-4" />
                    <span className="text-sm tracking-wide">{displayData.fuelData.title}</span>
                  </td>
                </tr>

                {displayData.fuelData.rows.map((row, rIdx) => {
                  const total = (!isFiltered && includeOctober) ? (row.total + (row.october || 0)) : row.total;
                  return (
                    <tr 
                      key={row.id} 
                      className={`border-b border-sky-200 transition ${
                        row.isHighlight 
                          ? 'bg-[#e0f2fe] font-bold text-[#004e7c]' 
                          : (rIdx % 2 === 1 ? 'bg-sky-50/20' : 'bg-white')
                      }`}
                    >
                      <td className={`py-3 px-4 border-r border-sky-200 ${
                        row.isHighlight ? 'font-black text-[#003B73] text-xs' : 'font-semibold text-slate-800'
                      }`}>
                        {row.label}
                      </td>
                      {activeMonths.map((m, mIdx) => {
                        const val = isFiltered ? row.values[mIdx] : (mIdx < 9 ? row.values[mIdx] : row.october);
                        return (
                          <td 
                            key={m.id} 
                            onClick={() => onSelectMonth && onSelectMonth(m.id)}
                            className="py-3 px-2.5 text-center tabular-nums font-bold text-[#004e7c] border-r border-sky-200 hover:bg-sky-200/50 cursor-pointer"
                          >
                            {row.type === 'decimal' ? formatDec(val) : formatInt(val)}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center tabular-nums font-black text-[#002844] bg-[#bae6fd] border-l border-sky-300">
                        {row.type === 'decimal' ? formatDec(total) : formatInt(total)}
                      </td>
                    </tr>
                  );
                })}

              </tbody>

            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sky-800/80 pt-2">
            <span className="flex items-center gap-1.5 font-medium">
              💡 คลิกที่ชื่อเดือนใดก็ได้เพื่อเปิดดูตารางรายงานสรุปแบบละเอียดของเดือนนั้น
            </span>
            {onSwitchToAnalytics && (
              <button
                onClick={onSwitchToAnalytics}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-sky-600/20 transition cursor-pointer"
              >
                <span>วิเคราะห์เจาะลึก 18 สาขา & แนวโน้มราคาน้ำมัน</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Bottom Decorative Water Ripple Banner */}
        <div className="w-full h-8 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-300 relative overflow-hidden" />

      </div>

    </div>
  );
}
