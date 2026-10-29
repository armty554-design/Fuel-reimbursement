import React, { useState } from 'react';
import { 
  Truck, 
  Users, 
  Coins, 
  Droplet, 
  Download, 
  Printer, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Gift,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  SPRINKLE_MONTHS, 
  SPRINKLE_OFFICIAL_DATA_9_MONTHS 
} from '../data/sprinkleExecutiveData';

export default function SprinkleExecutiveOverview({ onSelectMonth, onSwitchToAnalytics }) {
  const [includeOctober, setIncludeOctober] = useState(false);
  const data = SPRINKLE_OFFICIAL_DATA_9_MONTHS;

  const activeMonths = includeOctober 
    ? SPRINKLE_MONTHS 
    : SPRINKLE_MONTHS.slice(0, 9);

  // Helper formatters
  const formatInt = (val) => val != null ? Number(val).toLocaleString('th-TH') : '-';
  const formatDec = (val) => val != null ? Number(val).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows = [];

    // Header
    rows.push(['SPRINKLE DRINKING WATER - สรุปค่าจ้างบริการจัดส่ง']);
    rows.push([`ภาพรวมรายเดือน มกราคม – ${includeOctober ? 'ตุลาคม' : 'กันยายน'}`]);
    rows.push([]);

    // Table Header
    const headers = ['ข้อมูล/รายการ', ...activeMonths.map(m => m.shortName), 'รวม'];
    rows.push(headers);

    // Section 1: ข้อมูลการจัดส่ง
    rows.push([`🚚 ${data.deliveryData.title}`]);
    data.deliveryData.rows.forEach(r => {
      const vals = activeMonths.map((m, idx) => {
        if (idx < 9) return r.values[idx];
        return r.october;
      });
      const total = includeOctober ? (r.total + (r.october || 0)) : r.total;
      rows.push([r.label, ...vals, total]);
    });

    // Section 2: ค่าจ้างและค่าใช้จ่าย
    rows.push([]);
    rows.push([`💵 ${data.expensesData.title}`]);
    data.expensesData.rows.forEach(r => {
      const vals = activeMonths.map((m, idx) => {
        if (idx < 9) return r.values[idx];
        return r.october;
      });
      const total = includeOctober ? (r.total + (r.october || 0)) : r.total;
      rows.push([r.label, ...vals, total]);
    });

    // Subtotal 1
    const subBahtVals = activeMonths.map((m, idx) => idx < 9 ? data.expensesData.subtotalBaht.values[idx] : data.expensesData.subtotalBaht.october);
    rows.push([data.expensesData.subtotalBaht.label, ...subBahtVals, includeOctober ? (data.expensesData.subtotalBaht.total + data.expensesData.subtotalBaht.october) : data.expensesData.subtotalBaht.total]);

    const subPerTankVals = activeMonths.map((m, idx) => idx < 9 ? data.expensesData.subtotalPerTank.values[idx] : data.expensesData.subtotalPerTank.october);
    rows.push([data.expensesData.subtotalPerTank.label, ...subPerTankVals, data.expensesData.subtotalPerTank.total]);

    // Section 3: เงินรางวัลมาตรฐานจัดส่ง
    rows.push([]);
    rows.push([`🎁 ${data.incentivesData.title}`]);
    data.incentivesData.rows.forEach(r => {
      const vals = activeMonths.map((m, idx) => {
        if (idx < 9) return r.values[idx];
        return r.october;
      });
      const total = includeOctober ? (r.total + (r.october || 0)) : r.total;
      rows.push([r.label, ...vals, total]);
    });

    // Grand Total
    const gtBahtVals = activeMonths.map((m, idx) => idx < 9 ? data.incentivesData.grandTotalBaht.values[idx] : data.incentivesData.grandTotalBaht.october);
    rows.push([data.incentivesData.grandTotalBaht.label, ...gtBahtVals, includeOctober ? (data.incentivesData.grandTotalBaht.total + data.incentivesData.grandTotalBaht.october) : data.incentivesData.grandTotalBaht.total]);

    const gtPerTankVals = activeMonths.map((m, idx) => idx < 9 ? data.incentivesData.grandTotalPerTank.values[idx] : data.incentivesData.grandTotalPerTank.october);
    rows.push([data.incentivesData.grandTotalPerTank.label, ...gtPerTankVals, data.incentivesData.grandTotalPerTank.total]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'สรุปค่าจ้างบริการจัดส่ง');
    XLSX.writeFile(wb, `สรุปค่าจ้างบริการจัดส่ง_ภาพรวมรายเดือน.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-sky-100 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-400/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              มุมมองภาพรวมนำเสนอผู้บริหาร (Executive Sprinkle Overview)
            </h2>
            <p className="text-xs text-slate-500">
              ออกแบบตามสไลด์สรุปทางการของ Sprinkle ดื่มสะอาด ปลอดภัย ส่งตรงถึงคุณ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle October */}
          <button
            onClick={() => setIncludeOctober(!includeOctober)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
              includeOctober 
                ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-xs' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
                สรุปค่าจ้างบริการจัดส่ง
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
                {/* Winding road icon */}
                <svg className="w-7 h-7 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-5 0-5-4 0-4s5-4 0-4-5-4 0-4 5-4 0-4" />
                </svg>
              </div>
              <div>
                <span className="block text-xs font-bold text-sky-900/70">
                  ระยะทาง (กม.)
                </span>
                <span className="block text-2xl sm:text-3xl font-black text-[#003B73] tabular-nums tracking-tight">
                  {formatInt(includeOctober ? (data.kpi.distanceKm + data.deliveryData.rows[0].october) : data.kpi.distanceKm)}
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
                  {formatInt(includeOctober ? (data.kpi.members + data.deliveryData.rows[1].october) : data.kpi.members)}
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
                  {formatInt(includeOctober ? (data.kpi.deliveredTanks + data.deliveryData.rows[2].october) : data.kpi.deliveredTanks)}
                </span>
              </div>
            </div>

            {/* KPI 4: Total Delivery Wages */}
            <div className="bg-gradient-to-r from-white to-sky-50/60 p-4 sm:p-5 rounded-3xl border-2 border-sky-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#023e8a] to-[#0077b6] flex items-center justify-center text-white shadow-md shadow-blue-800/25 shrink-0">
                <Coins className="w-7 h-7" />
              </div>
              <div>
                <span className="block text-xs font-bold text-sky-900/70">
                  ค่าจ้างบริการจัดส่ง (บาท)
                </span>
                <span className="block text-2xl sm:text-3xl font-black text-[#003B73] tabular-nums tracking-tight">
                  {formatInt(includeOctober ? (data.kpi.deliveryWagesBaht + data.expensesData.rows[0].october) : data.kpi.deliveryWagesBaht)}
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
                  <th className="py-3 px-4 text-left font-bold text-sm tracking-wide border-r border-[#006096] w-64">
                    ข้อมูล/รายการ
                  </th>
                  {activeMonths.map((m) => (
                    <th 
                      key={m.id} 
                      onClick={() => onSelectMonth && onSelectMonth(m.id)}
                      className="py-3 px-2.5 text-center font-bold text-sm border-r border-[#006096] hover:bg-[#003d61] cursor-pointer transition"
                      title={`คลิกเพื่อดูรายละเอียดสรุปเดือน ${m.name}`}
                    >
                      {m.shortName}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center font-black text-sm bg-[#006d9e] border-l border-[#005a82]">
                    รวม
                  </th>
                </tr>
              </thead>

              <tbody>
                
                {/* 🚚 GROUP 1: ข้อมูลการจัดส่ง */}
                <tr className="bg-[#0284c7] text-white font-bold text-xs">
                  <td colSpan={activeMonths.length + 2} className="py-2 px-4 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm tracking-wide">{data.deliveryData.title}</span>
                  </td>
                </tr>

                {data.deliveryData.rows.map((row, rIdx) => {
                  const total = includeOctober ? (row.total + (row.october || 0)) : row.total;
                  return (
                    <tr 
                      key={row.id} 
                      className={`border-b border-sky-100 hover:bg-sky-50/50 transition ${
                        rIdx % 2 === 1 ? 'bg-sky-50/20' : 'bg-white'
                      }`}
                    >
                      <td className="py-2 px-4 font-semibold text-slate-800 border-r border-sky-100">
                        {row.label}
                      </td>
                      {activeMonths.map((m, mIdx) => {
                        const val = mIdx < 9 ? row.values[mIdx] : row.october;
                        return (
                          <td 
                            key={m.id} 
                            onClick={() => onSelectMonth && onSelectMonth(m.id)}
                            className="py-2 px-2.5 text-center tabular-nums text-slate-800 font-medium border-r border-sky-100 hover:bg-sky-100/60 cursor-pointer"
                          >
                            {row.type === 'decimal' ? formatDec(val) : formatInt(val)}
                          </td>
                        );
                      })}
                      <td className="py-2 px-4 text-center tabular-nums font-bold text-[#003B73] bg-sky-50/80 border-l border-sky-200">
                        {row.type === 'decimal' ? formatDec(total) : formatInt(total)}
                      </td>
                    </tr>
                  );
                })}

                {/* 💵 GROUP 2: ค่าจ้างและค่าใช้จ่าย */}
                <tr className="bg-[#0284c7] text-white font-bold text-xs">
                  <td colSpan={activeMonths.length + 2} className="py-2 px-4 flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    <span className="text-sm tracking-wide">{data.expensesData.title}</span>
                  </td>
                </tr>

                {data.expensesData.rows.map((row, rIdx) => {
                  const total = includeOctober ? (row.total + (row.october || 0)) : row.total;
                  return (
                    <tr 
                      key={row.id} 
                      className={`border-b border-sky-100 hover:bg-sky-50/50 transition ${
                        rIdx % 2 === 1 ? 'bg-sky-50/20' : 'bg-white'
                      }`}
                    >
                      <td className="py-2 px-4 font-semibold text-slate-800 border-r border-sky-100">
                        {row.label}
                      </td>
                      {activeMonths.map((m, mIdx) => {
                        const val = mIdx < 9 ? row.values[mIdx] : row.october;
                        return (
                          <td 
                            key={m.id} 
                            onClick={() => onSelectMonth && onSelectMonth(m.id)}
                            className="py-2 px-2.5 text-center tabular-nums text-slate-800 font-medium border-r border-sky-100 hover:bg-sky-100/60 cursor-pointer"
                          >
                            {row.type === 'decimal' ? formatDec(val) : formatInt(val)}
                          </td>
                        );
                      })}
                      <td className="py-2 px-4 text-center tabular-nums font-bold text-[#003B73] bg-sky-50/80 border-l border-sky-200">
                        {row.type === 'decimal' ? formatDec(total) : formatInt(total)}
                      </td>
                    </tr>
                  );
                })}

                {/* Subtotal 1 (ค่าจ้าง รวม ชดเชยน้ำมัน + อาคารสูง + ทางด่วน) - บาท */}
                <tr className="bg-[#e0f2fe] border-y-2 border-sky-200 font-bold text-slate-900">
                  <td className="py-2 px-4 font-bold text-[#004e7c] border-r border-sky-200">
                    {data.expensesData.subtotalBaht.label}
                  </td>
                  {activeMonths.map((m, mIdx) => {
                    const val = mIdx < 9 
                      ? data.expensesData.subtotalBaht.values[mIdx] 
                      : data.expensesData.subtotalBaht.october;
                    return (
                      <td 
                        key={m.id} 
                        onClick={() => onSelectMonth && onSelectMonth(m.id)}
                        className="py-2 px-2.5 text-center tabular-nums font-bold text-[#004e7c] border-r border-sky-200 hover:bg-sky-200/50 cursor-pointer"
                      >
                        {formatInt(val)}
                      </td>
                    );
                  })}
                  <td className="py-2 px-4 text-center tabular-nums font-black text-[#003B73] bg-sky-200/80 border-l border-sky-300">
                    {formatInt(includeOctober ? (data.expensesData.subtotalBaht.total + data.expensesData.subtotalBaht.october) : data.expensesData.subtotalBaht.total)}
                  </td>
                </tr>

                {/* Subtotal 1 - บาท/ถัง */}
                <tr className="bg-[#e0f2fe]/70 border-b-2 border-sky-200 font-bold text-slate-900">
                  <td className="py-2 px-4 font-bold text-[#004e7c] border-r border-sky-200">
                    {data.expensesData.subtotalPerTank.label}
                  </td>
                  {activeMonths.map((m, mIdx) => {
                    const val = mIdx < 9 
                      ? data.expensesData.subtotalPerTank.values[mIdx] 
                      : data.expensesData.subtotalPerTank.october;
                    return (
                      <td 
                        key={m.id} 
                        onClick={() => onSelectMonth && onSelectMonth(m.id)}
                        className="py-2 px-2.5 text-center tabular-nums font-bold text-[#004e7c] border-r border-sky-200 hover:bg-sky-200/50 cursor-pointer"
                      >
                        {formatDec(val)}
                      </td>
                    );
                  })}
                  <td className="py-2 px-4 text-center tabular-nums font-black text-[#003B73] bg-sky-200/80 border-l border-sky-300">
                    {formatDec(data.expensesData.subtotalPerTank.total)}
                  </td>
                </tr>

                {/* 🎁 GROUP 3: เงินรางวัลมาตรฐานจัดส่ง */}
                <tr className="bg-[#0284c7] text-white font-bold text-xs">
                  <td colSpan={activeMonths.length + 2} className="py-2 px-4 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    <span className="text-sm tracking-wide">{data.incentivesData.title}</span>
                  </td>
                </tr>

                {data.incentivesData.rows.map((row, rIdx) => {
                  const total = includeOctober ? (row.total + (row.october || 0)) : row.total;
                  return (
                    <tr 
                      key={row.id} 
                      className={`border-b border-sky-100 hover:bg-sky-50/50 transition ${
                        rIdx % 2 === 1 ? 'bg-sky-50/20' : 'bg-white'
                      }`}
                    >
                      <td className="py-2 px-4 font-semibold text-slate-800 border-r border-sky-100">
                        {row.label}
                      </td>
                      {activeMonths.map((m, mIdx) => {
                        const val = mIdx < 9 ? row.values[mIdx] : row.october;
                        return (
                          <td 
                            key={m.id} 
                            onClick={() => onSelectMonth && onSelectMonth(m.id)}
                            className="py-2 px-2.5 text-center tabular-nums text-slate-800 font-medium border-r border-sky-100 hover:bg-sky-100/60 cursor-pointer"
                          >
                            {row.type === 'decimal' ? formatDec(val) : formatInt(val)}
                          </td>
                        );
                      })}
                      <td className="py-2 px-4 text-center tabular-nums font-bold text-[#003B73] bg-sky-50/80 border-l border-sky-200">
                        {row.type === 'decimal' ? formatDec(total) : formatInt(total)}
                      </td>
                    </tr>
                  );
                })}

                {/* 🌟 GRAND TOTAL (รวมทุกรายการสุทธิ) - บาท */}
                <tr className="bg-[#bae6fd] border-t-2 border-sky-300 font-bold text-slate-900">
                  <td className="py-2.5 px-4 font-black text-[#002f4d] border-r border-sky-300">
                    {data.incentivesData.grandTotalBaht.label}
                  </td>
                  {activeMonths.map((m, mIdx) => {
                    const val = mIdx < 9 
                      ? data.incentivesData.grandTotalBaht.values[mIdx] 
                      : data.incentivesData.grandTotalBaht.october;
                    return (
                      <td 
                        key={m.id} 
                        onClick={() => onSelectMonth && onSelectMonth(m.id)}
                        className="py-2.5 px-2.5 text-center tabular-nums font-black text-[#002f4d] border-r border-sky-300 hover:bg-sky-300/50 cursor-pointer"
                      >
                        {formatInt(val)}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-4 text-center tabular-nums font-black text-[#002844] bg-[#7dd3fc] border-l border-sky-400">
                    {formatInt(includeOctober ? (data.incentivesData.grandTotalBaht.total + data.incentivesData.grandTotalBaht.october) : data.incentivesData.grandTotalBaht.total)}
                  </td>
                </tr>

                {/* 🌟 GRAND TOTAL - บาท/ถัง */}
                <tr className="bg-[#bae6fd]/80 border-b-2 border-sky-400 font-bold text-slate-900">
                  <td className="py-2 px-4 font-black text-[#002f4d] border-r border-sky-300">
                    {data.incentivesData.grandTotalPerTank.label}
                  </td>
                  {activeMonths.map((m, mIdx) => {
                    const val = mIdx < 9 
                      ? data.incentivesData.grandTotalPerTank.values[mIdx] 
                      : data.incentivesData.grandTotalPerTank.october;
                    return (
                      <td 
                        key={m.id} 
                        onClick={() => onSelectMonth && onSelectMonth(m.id)}
                        className="py-2 px-2.5 text-center tabular-nums font-black text-[#002f4d] border-r border-sky-300 hover:bg-sky-300/50 cursor-pointer"
                      >
                        {formatDec(val)}
                      </td>
                    );
                  })}
                  <td className="py-2 px-4 text-center tabular-nums font-black text-[#002844] bg-[#7dd3fc] border-l border-sky-400">
                    {formatDec(data.incentivesData.grandTotalPerTank.total)}
                  </td>
                </tr>

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
