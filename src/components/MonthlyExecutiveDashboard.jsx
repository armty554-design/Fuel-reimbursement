import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Truck, 
  Fuel, 
  Package, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Download, 
  Building2, 
  Layers, 
  Award,
  ChevronRight,
  Eye,
  Percent,
  CheckCircle2,
  Sparkles,
  Filter,
  Search,
  ArrowUpDown,
  RotateCcw,
  LayoutGrid,
  Car
} from 'lucide-react';
import * as XLSX from 'xlsx';
import SprinkleExecutiveOverview from './SprinkleExecutiveOverview';
import MultiSelectDropdown from './MultiSelectDropdown';

export default function MonthlyExecutiveDashboard({
  monthList = [],
  allDailyOfficial = {},
  allDriverSummaries = {},
  allFuelPrices = {},
  branches = [],
  basePrice = 30.0,
  onSelectMonth
}) {
  const [selectedMetric, setSelectedMetric] = useState('compensation'); // 'compensation' | 'mileage' | 'fuel' | 'price' | 'tanks'
  const [selectedBranches, setSelectedBranches] = useState([]); // [] = all
  const [selectedVehicles, setSelectedVehicles] = useState([]); // [] = all
  const [viewMode, setViewMode] = useState('sprinkle'); // 'sprinkle' | 'analytics'
  
  // Matrix view controls
  const [matrixPeriod, setMatrixPeriod] = useState('all'); // 'all' | '03' | '04' ... '10'
  const [branchSearch, setBranchSearch] = useState('');
  const [branchSortBy, setBranchSortBy] = useState('comp'); // 'comp' | 'km' | 'tanks' | 'costPerTank' | 'id'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const isFiltered = selectedBranches.length > 0 || selectedVehicles.length > 0;

  // Master Branch Map for fast lookup
  const branchMap = useMemo(() => {
    const map = {};
    branches.forEach(b => {
      map[b.id] = b;
    });
    return map;
  }, [branches]);

  const branchOptions = useMemo(() => {
    const latestMonth = monthList[monthList.length - 1]?.key || '10';
    return branches.map(b => {
      const count = (allDriverSummaries[latestMonth] || []).filter(d => d.branch === b.id).length;
      return {
        value: b.id,
        label: `สาขา ${b.id} - ${b.name}`,
        shortLabel: b.id,
        subLabel: `${count} คัน`
      };
    });
  }, [branches, monthList, allDriverSummaries]);

  const vehicleOptions = useMemo(() => {
    const latestMonth = monthList[monthList.length - 1]?.key || '10';
    const drivers = allDriverSummaries[latestMonth] || [];
    const list = selectedBranches.length === 0
      ? drivers
      : drivers.filter(d => selectedBranches.includes(d.branch));

    return list.map(d => ({
      value: d.vehicleNo,
      label: d.vehicleNo,
      shortLabel: d.vehicleNo,
      subLabel: `${d.branchName || d.branch} (${d.fullName})`
    })).sort((a, b) => a.value.localeCompare(b.value));
  }, [allDriverSummaries, monthList, selectedBranches]);

  // Compute aggregated stats for each month (03 to 10)
  const allMonthlyData = useMemo(() => {
    let prevComp = 0;
    let prevKm = 0;

    return monthList.map((m, index) => {
      const mKey = m.key;
      const daily = allDailyOfficial[mKey] || [];
      const drivers = allDriverSummaries[mKey] || [];
      const prices = allFuelPrices[mKey] || {};

      const totalKm = daily.reduce((acc, d) => acc + (d.km || 0), 0);
      const totalLitres = daily.reduce((acc, d) => acc + (d.litres || 0), 0);
      const totalComp = daily.reduce((acc, d) => acc + (d.comp || 0), 0);
      const totalTanks = daily.reduce((acc, d) => acc + (d.tanks || 0), 0);

      const priceVals = Object.values(prices).filter(p => p > 0);
      const avgPrice = priceVals.length ? (priceVals.reduce((a, b) => a + b, 0) / priceVals.length) : 0;
      const costPerTank = totalTanks > 0 ? (totalComp / totalTanks) : 0;

      // Month-over-Month (MoM) Growth
      const momCompGrowth = index > 0 && prevComp > 0 ? ((totalComp - prevComp) / prevComp) * 100 : 0;
      const momKmGrowth = index > 0 && prevKm > 0 ? ((totalKm - prevKm) / prevKm) * 100 : 0;
      prevComp = totalComp;
      prevKm = totalKm;

      // Branch breakdown
      const branchStats = {};
      branches.forEach(b => {
        branchStats[b.id] = { id: b.id, name: b.name, km: 0, comp: 0, tanks: 0, count: 0 };
      });

      drivers.forEach(d => {
        const bId = d.branch || '10';
        if (!branchStats[bId]) {
          branchStats[bId] = { id: bId, name: d.branchName || bId, km: 0, comp: 0, tanks: 0, count: 0 };
        }
        branchStats[bId].count++;
        branchStats[bId].km += d.totalKm || 0;
        branchStats[bId].comp += d.totalCompensation || 0;
        branchStats[bId].tanks += d.deliveryUnits || 0;
      });

      return {
        key: mKey,
        name: m.name,
        shortName: m.shortName || m.name.replace(' 2569', ''),
        days: m.days,
        driverCount: drivers.length,
        totalKm: parseFloat(totalKm.toFixed(1)),
        totalLitres: parseFloat(totalLitres.toFixed(2)),
        avgPrice: parseFloat(avgPrice.toFixed(2)),
        avgCompRate: parseFloat(Math.max(0, avgPrice - basePrice).toFixed(2)),
        totalComp: parseFloat(totalComp.toFixed(2)),
        totalTanks,
        costPerTank: parseFloat(costPerTank.toFixed(2)),
        momCompGrowth: parseFloat(momCompGrowth.toFixed(1)),
        momKmGrowth: parseFloat(momKmGrowth.toFixed(1)),
        branchStats
      };
    });
  }, [monthList, allDailyOfficial, allDriverSummaries, allFuelPrices, branches, basePrice]);

  // Display Monthly Data filtered by selected branches & vehicles
  const monthlyData = useMemo(() => {
    let prevComp = 0;
    let prevKm = 0;

    return allMonthlyData.map((m, index) => {
      if (!isFiltered) {
        return m;
      }

      const mKey = m.key;
      const drivers = allDriverSummaries[mKey] || [];
      const filteredDrivers = drivers.filter(d => {
        const matchB = selectedBranches.length === 0 || selectedBranches.includes(d.branch);
        const matchV = selectedVehicles.length === 0 || selectedVehicles.includes(d.vehicleNo);
        return matchB && matchV;
      });

      const km = filteredDrivers.reduce((acc, d) => acc + (d.totalKm || 0), 0);
      const comp = filteredDrivers.reduce((acc, d) => acc + (d.totalCompensation || 0), 0);
      const litres = parseFloat((km / 11.0).toFixed(2));
      const tanks = filteredDrivers.reduce((acc, d) => acc + (d.deliveryUnits || 0), 0);
      const costPerTank = tanks > 0 ? parseFloat((comp / tanks).toFixed(2)) : 0;
      
      const momCompGrowth = index > 0 && prevComp > 0 ? ((comp - prevComp) / prevComp) * 100 : 0;
      const momKmGrowth = index > 0 && prevKm > 0 ? ((km - prevKm) / prevKm) * 100 : 0;
      prevComp = comp;
      prevKm = km;

      return {
        ...m,
        driverCount: filteredDrivers.length,
        totalKm: parseFloat(km.toFixed(1)),
        totalLitres: litres,
        totalComp: parseFloat(comp.toFixed(2)),
        totalTanks: tanks,
        costPerTank,
        momCompGrowth: parseFloat(momCompGrowth.toFixed(1)),
        momKmGrowth: parseFloat(momKmGrowth.toFixed(1))
      };
    });
  }, [allMonthlyData, isFiltered, selectedBranches, selectedVehicles, allDriverSummaries]);

  // Active Filter Info
  const activeFilterInfo = useMemo(() => {
    if (!isFiltered) {
      return { name: 'ทุกสาขา (รวม 18 สาขา)', vehicleCount: 342 };
    }
    const bText = selectedBranches.length > 0 
      ? `${selectedBranches.length} สาขาที่เลือก`
      : 'ทุกสาขา';
    const vText = selectedVehicles.length > 0
      ? `${selectedVehicles.length} คันที่เลือก`
      : '';
    return {
      name: [bText, vText].filter(Boolean).join(' • '),
      vehicleCount: monthlyData[monthlyData.length - 1]?.driverCount || 0
    };
  }, [isFiltered, selectedBranches, selectedVehicles, monthlyData]);

  // Annual Totals (YTD) based on current branch filter
  const ytdTotals = useMemo(() => {
    const totalComp = monthlyData.reduce((acc, m) => acc + m.totalComp, 0);
    const totalKm = monthlyData.reduce((acc, m) => acc + m.totalKm, 0);
    const totalLitres = monthlyData.reduce((acc, m) => acc + m.totalLitres, 0);
    const totalTanks = monthlyData.reduce((acc, m) => acc + m.totalTanks, 0);
    const avgPrice = monthlyData.length ? (monthlyData.reduce((acc, m) => acc + m.avgPrice, 0) / monthlyData.length) : 0;
    const avgCostPerTank = totalTanks > 0 ? (totalComp / totalTanks) : 0;

    return {
      totalComp,
      totalKm,
      totalLitres,
      totalTanks,
      avgPrice,
      avgCostPerTank
    };
  }, [monthlyData]);

  // Overall Company Grand Total for calculating Branch Percentage Share
  const companyTotalCompYTD = useMemo(() => {
    return allMonthlyData.reduce((acc, m) => acc + m.totalComp, 0);
  }, [allMonthlyData]);

  // Max values for chart scaling
  const maxComp = Math.max(...monthlyData.map(m => m.totalComp), 1);
  const maxKm = Math.max(...monthlyData.map(m => m.totalKm), 1);

  // 18-Branch Performance Matrix Data (by period)
  const branchMatrixData = useMemo(() => {
    let totalPeriodComp = 0;

    const list = branches.map(b => {
      let bKm = 0;
      let bComp = 0;
      let bTanks = 0;
      let bCount = 0;

      if (matrixPeriod === 'all') {
        allMonthlyData.forEach(m => {
          const bs = m.branchStats[b.id];
          if (bs) {
            bKm += bs.km;
            bComp += bs.comp;
            bTanks += bs.tanks;
            bCount = Math.max(bCount, bs.count);
          }
        });
      } else {
        const m = allMonthlyData.find(x => x.key === matrixPeriod);
        if (m) {
          const bs = m.branchStats[b.id];
          if (bs) {
            bKm = bs.km;
            bComp = bs.comp;
            bTanks = bs.tanks;
            bCount = bs.count;
          }
        }
      }

      totalPeriodComp += bComp;

      const litres = parseFloat((bKm / 11.0).toFixed(2));
      const costPerTank = bTanks > 0 ? parseFloat((bComp / bTanks).toFixed(2)) : 0;

      return {
        id: b.id,
        name: b.name,
        count: bCount,
        km: parseFloat(bKm.toFixed(1)),
        litres,
        comp: parseFloat(bComp.toFixed(2)),
        tanks: bTanks,
        costPerTank
      };
    });

    // Add % share of total compensation
    const listWithShare = list.map(b => ({
      ...b,
      sharePercent: totalPeriodComp > 0 ? parseFloat(((b.comp / totalPeriodComp) * 100).toFixed(1)) : 0
    }));

    // Filter by selectedBranches if any
    const branchFiltered = selectedBranches.length > 0
      ? listWithShare.filter(b => selectedBranches.includes(b.id))
      : listWithShare;

    // Filter by search
    const filtered = branchFiltered.filter(b => {
      const term = branchSearch.trim().toLowerCase();
      if (!term) return true;
      return b.id.toLowerCase().includes(term) || b.name.toLowerCase().includes(term);
    });

    // Sort
    filtered.sort((a, b) => {
      let valA = a[branchSortBy];
      let valB = b[branchSortBy];
      if (branchSortBy === 'id') {
        valA = parseInt(a.id) || 0;
        valB = parseInt(b.id) || 0;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return {
      rows: filtered,
      totalComp: totalPeriodComp,
      totalKm: list.reduce((a, b) => a + b.km, 0),
      totalLitres: list.reduce((a, b) => a + b.litres, 0),
      totalTanks: list.reduce((a, b) => a + b.tanks, 0),
      totalVehicles: list.reduce((a, b) => a + b.count, 0)
    };
  }, [branches, allMonthlyData, matrixPeriod, branchSearch, branchSortBy, sortOrder, selectedBranches]);

  // Export Executive Multi-Month Report
  const handleExportAllMonths = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: เปรียบเทียบภาพรวมรายเดือน (8 เดือน)
    const summarySheetData = monthlyData.map((m, idx) => ({
      'ลำดับ': idx + 1,
      'เดือน': m.name,
      'จำนวนวัน': m.days,
      'จำนวนรถ (คัน)': m.driverCount,
      'ระยะทางสุทธิ DIFF+10% (กม.)': m.totalKm,
      'ปริมาณน้ำมัน (ลิตร)': m.totalLitres,
      'ราคาน้ำมันเฉลี่ย (บาท/ลิตร)': m.avgPrice,
      'อัตราเงินชดเชยเฉลี่ย (บาท/ลิตร)': m.avgCompRate,
      'ยอดเงินชดเชยรวม (บาท)': m.totalComp,
      'ยอดส่งสินค้า (ถัง)': m.totalTanks,
      'ต้นทุนชดเชยเฉลี่ย (บาท/ถัง)': m.costPerTank,
      'การเปลี่ยนแปลงยอดชดเชย (% MoM)': `${m.momCompGrowth}%`
    }));

    const wsSummary = XLSX.utils.json_to_sheet(summarySheetData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'ภาพรวมรายเดือน');

    // Sheet 2: สรุปแยก 18 สาขา
    const branchSheetData = branchMatrixData.rows.map((b, idx) => ({
      'อันดับ': idx + 1,
      'รหัสสาขา': b.id,
      'ชื่อสาขา': b.name,
      'จำนวนรถ (คัน)': b.count,
      'รวมระยะทาง (กม.)': b.km,
      'น้ำมันที่ใช้ (ลิตร)': b.litres,
      'เงินชดเชยรวม (บาท)': b.comp,
      'สัดส่วน (% ขององค์กร)': `${b.sharePercent}%`,
      'ยอดส่ง (ถัง)': b.tanks,
      'ต้นทุนเฉลี่ย (บาท/ถัง)': b.costPerTank
    }));

    const wsBranch = XLSX.utils.json_to_sheet(branchSheetData);
    XLSX.utils.book_append_sheet(wb, wsBranch, 'สรุปแยก 18 สาขา');

    XLSX.writeFile(wb, `รายงานวิเคราะห์ภาพรวมค่าชดเชยน้ำมัน_8เดือน_แยก18สาขา.xlsx`);
  };

  const handleBranchSelect = (bId) => {
    setSelectedBranches([bId]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      
      {/* 🌟 View Mode Switcher & Multi-Select Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs print:hidden">
        {/* Left: View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('sprinkle')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              viewMode === 'sprinkle'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>หน้ารวมสรุปภาพรวมทางการ (Sprinkle)</span>
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              viewMode === 'analytics'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>วิเคราะห์เจาะลึก 18 สาขา & แนวโน้ม</span>
          </button>
        </div>

        {/* Right: Multi-select Filters for สาขา & เบอร์รถ */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Multi-select Branch Filter */}
          <MultiSelectDropdown
            label="สาขา"
            icon={Building2}
            options={branchOptions}
            selectedValues={selectedBranches}
            onChange={setSelectedBranches}
            placeholder="เลือกสาขา..."
            allLabel="ทุกสาขา"
          />

          {/* Multi-select Vehicle Filter */}
          <MultiSelectDropdown
            label="เบอร์รถ"
            icon={Car}
            options={vehicleOptions}
            selectedValues={selectedVehicles}
            onChange={setSelectedVehicles}
            placeholder="เลือกเบอร์รถ..."
            allLabel="ทุกคัน"
          />

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={() => {
                setSelectedBranches([]);
                setSelectedVehicles([]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-2xl text-xs font-semibold border border-red-200 transition cursor-pointer"
              title="ล้างตัวกรองทั้งหมด"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้างตัวกรอง ({selectedBranches.length + selectedVehicles.length})</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'sprinkle' ? (
        <div className="space-y-6">
          <SprinkleExecutiveOverview 
            onSelectMonth={onSelectMonth} 
            onSwitchToAnalytics={() => setViewMode('analytics')}
            selectedBranches={selectedBranches}
            selectedVehicles={selectedVehicles}
            allDailyOfficial={allDailyOfficial}
            allFuelPrices={allFuelPrices}
            allDriverSummaries={allDriverSummaries}
            monthList={monthList}
            basePrice={basePrice}
          />
        </div>
      ) : (
        <>
          {/* Top Banner & Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ภาพรวมเชิงบริหาร • Executive Multi-Month Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              แดชบอร์ดภาพรวมค่าชดเชยน้ำมันรายเดือน
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              วิเคราะห์แนวโน้มเงินชดเชยค่าน้ำมันเปรียบเทียบ 8 เดือน (มีนาคม – ตุลาคม 2569) รวม 18 สาขา 
              และเชื่อมโยงกับความผันผวนของราคาน้ำมันดีเซลรายวัน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportAllMonths}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-900/30 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดรายงานรวม 8 เดือน (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter status in Analytics view */}
      {isFiltered && (
        <div className="bg-white px-5 py-3 rounded-2xl border border-blue-200 shadow-2xs flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>กำลังกรองข้อมูล: <strong className="text-slate-900">{activeFilterInfo.name}</strong> ({activeFilterInfo.vehicleCount} คัน)</span>
          </div>
          <button
            onClick={() => {
              setSelectedBranches([]);
              setSelectedVehicles([]);
            }}
            className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}

      {/* 5 High-Level YTD KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Compensation YTD */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ยอดชดเชยสะสมทั้งปี (YTD)
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-xs font-bold text-slate-400">฿</span>
            <span className="text-2xl font-extrabold tabular-nums text-slate-900">
              {ytdTotals.totalComp >= 1000000 
                ? `${(ytdTotals.totalComp / 1000000).toFixed(2)}M`
                : `${(ytdTotals.totalComp / 1000).toFixed(1)}k`}
            </span>
            <span className="text-xs text-slate-400 font-medium">บาท</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
            <span>฿{ytdTotals.totalComp.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Card 2: Total Km YTD */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ระยะทางสะสมรวม (กม.)
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tabular-nums text-slate-900">
              {ytdTotals.totalKm >= 1000000 
                ? `${(ytdTotals.totalKm / 1000000).toFixed(2)}M`
                : `${(ytdTotals.totalKm / 1000).toFixed(1)}k`}
            </span>
            <span className="text-xs text-slate-400 font-medium">กม.</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold">
            {ytdTotals.totalKm.toLocaleString('th-TH', { minimumFractionDigits: 1 })} กม. สุทธิ
          </div>
        </div>

        {/* Card 3: Total Litres YTD */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ปริมาณน้ำมันที่ใช้จริง
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tabular-nums text-slate-900">
              {(ytdTotals.totalLitres / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-400 font-medium">ลิตร</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-semibold">
            {ytdTotals.totalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ลิตร
          </div>
        </div>

        {/* Card 4: Total Tanks Delivered YTD */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ยอดส่งสินค้าสะสม
            </span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tabular-nums text-slate-900">
              {ytdTotals.totalTanks >= 1000000 
                ? `${(ytdTotals.totalTanks / 1000000).toFixed(2)}M`
                : `${(ytdTotals.totalTanks / 1000).toFixed(1)}k`}
            </span>
            <span className="text-xs text-slate-400 font-medium">ถัง</span>
          </div>
          <div className="mt-2 text-[11px] text-sky-700 font-semibold">
            {ytdTotals.totalTanks.toLocaleString('th-TH')} ถัง
          </div>
        </div>

        {/* Card 5: Cost per Tank Efficiency */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ต้นทุนชดเชยเฉลี่ย / ถัง
            </span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-xs font-bold text-slate-400">฿</span>
            <span className="text-2xl font-extrabold tabular-nums text-purple-700">
              {ytdTotals.avgCostPerTank.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ถัง</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-700 font-medium">
            ราคาน้ำมันเฉลี่ยทั้งปี ฿{ytdTotals.avgPrice.toFixed(2)}/ลิตร
          </div>
        </div>

      </div>

      {/* Main Visual Comparison Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Monthly Compensation & Diesel Price Trend (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  แนวโน้มค่าชดเชยน้ำมัน vs ราคาน้ำมันดีเซล ({activeFilterInfo.name})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                คลิกที่แท่งกราฟของแต่ละเดือนเพื่อเปิดดูรายงานสรุปรายละเอียดประจำเดือนนั้นได้ทันที
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
              <span className="text-slate-500 px-2">ตัวชี้วัด:</span>
              <button
                onClick={() => setSelectedMetric('compensation')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                  selectedMetric === 'compensation' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ยอดเงิน (บาท)
              </button>
              <button
                onClick={() => setSelectedMetric('mileage')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                  selectedMetric === 'mileage' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ระยะทาง (กม.)
              </button>
            </div>
          </div>

          {/* Dynamic SVG Visual Chart */}
          <div className="py-6">
            <div className="h-64 flex items-end gap-3 sm:gap-6 pt-6 px-2">
              {monthlyData.map((m) => {
                const heightPercent = selectedMetric === 'compensation'
                  ? Math.max(12, Math.round((m.totalComp / maxComp) * 100))
                  : Math.max(12, Math.round((m.totalKm / maxKm) * 100));

                const isHighest = m.totalComp === maxComp;

                return (
                  <div 
                    key={m.key} 
                    onClick={() => onSelectMonth && onSelectMonth(m.key)}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    title={`คลิกเพื่อเปิดรายงานสรุป ${m.name}`}
                  >
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] rounded-xl px-3 py-2 shadow-xl whitespace-nowrap z-20 pointer-events-none text-center">
                      <div className="font-bold">{m.name}</div>
                      <div>ยอดชดเชย: ฿{m.totalComp.toLocaleString('th-TH')}</div>
                      <div>ราคาน้ำมันเฉลี่ย: ฿{m.avgPrice.toFixed(2)}/ลิตร</div>
                      <div className="text-[10px] text-blue-300 font-bold mt-0.5">👉 คลิกเพื่อเปิดรายงานสรุป</div>
                    </div>

                    {/* Value Badge on Top of Bar */}
                    <div className="text-[10px] tabular-nums font-bold text-slate-700 mb-2 transition group-hover:text-blue-600">
                      {selectedMetric === 'compensation'
                        ? `฿${(m.totalComp / 1000).toFixed(0)}k`
                        : `${(m.totalKm / 1000).toFixed(0)}k`}
                    </div>

                    {/* Bar Column */}
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-t-2xl overflow-hidden relative flex flex-col justify-end" style={{ height: '100%' }}>
                      <div 
                        className={`w-full rounded-t-2xl transition-all duration-500 ease-out ${
                          isHighest 
                            ? 'bg-gradient-to-t from-blue-700 to-indigo-500 shadow-md shadow-blue-500/30' 
                            : 'bg-gradient-to-t from-blue-600/80 to-blue-400 group-hover:from-blue-600 group-hover:to-blue-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        {isHighest && (
                          <div className="absolute top-1 left-1/2 -translate-x-1/2">
                            <span className="text-[9px] bg-white/20 text-white px-1 rounded-sm font-bold">MAX</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Month Label */}
                    <div className="mt-3 text-center">
                      <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition block">
                        {m.shortName}
                      </span>
                      <span className="text-[10px] tabular-nums text-purple-600 font-semibold block">
                        ฿{m.avgPrice.toFixed(1)}/L
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                <span className="text-slate-600 font-medium">ยอดเงินชดเชยน้ำมัน</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                <span className="text-slate-600 font-medium">ราคาน้ำมันดีเซลเฉลี่ย (บาท/ลิตร)</span>
              </span>
            </div>
            <span className="text-[11px] tabular-nums">เกณฑ์ฐาน: ฿{basePrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Chart 2: Cost per Tank Efficiency (1 Column) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                ต้นทุนชดเชยต่อถัง (บาท/ถัง)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              วัดประสิทธิภาพต้นทุนต่อหน่วยส่ง (ยิ่งต่ำ = ยิ่งประหยัด)
            </p>
          </div>

          {/* Horizontal Metric Bars for Cost per Tank */}
          <div className="py-4 space-y-3.5">
            {monthlyData.map(m => {
              const widthPercent = Math.min(100, Math.round((m.costPerTank / 0.70) * 100));
              const isBest = m.costPerTank === Math.min(...monthlyData.map(x => x.costPerTank));
              const isWorst = m.costPerTank === Math.max(...monthlyData.map(x => x.costPerTank));

              return (
                <div key={m.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span>{m.shortName}</span>
                      {isBest && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">ต่ำสุด</span>}
                      {isWorst && <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-bold">สูงสุด</span>}
                    </span>
                    <span className="tabular-nums font-bold text-slate-900">
                      ฿{m.costPerTank.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">/ถัง</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBest ? 'bg-emerald-500' : isWorst ? 'bg-red-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>เกณฑ์เฉลี่ยทั้งปี</span>
            <span className="tabular-nums font-bold text-purple-700">฿{ytdTotals.avgCostPerTank.toFixed(2)} /ถัง</span>
          </div>
        </div>

      </div>

      {/* Monthly Comparative Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                ตารางเปรียบเทียบค่าชดเชยน้ำมันรายเดือน (8 เดือน ประจำปี 2569 - {activeFilterInfo.name})
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              คลิกที่แถวเดือนใดก็ได้ เพื่อเปิดหน้ารายงานสรุปรายละเอียดรายวันและรายบุคคลของเดือนนั้น
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-50/80 px-3.5 py-1.5 rounded-2xl border border-blue-200/80 text-blue-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>คลิกแถวเพื่อดูรายงานสรุปประจำเดือน</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-center w-12">ลำดับ</th>
                <th className="py-3 px-4 min-w-[150px]">ประจำเดือน</th>
                <th className="py-3 px-3 text-center w-16">วัน</th>
                <th className="py-3 px-3 text-center w-20">รถวิ่ง (คัน)</th>
                <th className="py-3 px-4 text-right">เลขไมล์สุทธิ (กม.)</th>
                <th className="py-3 px-4 text-right">น้ำมันใช้จริง (ลิตร)</th>
                <th className="py-3 px-4 text-right">ราคาน้ำมันเฉลี่ย</th>
                <th className="py-3 px-4 text-right">อัตราชดเชยเฉลี่ย</th>
                <th className="py-3 px-4 text-right font-bold text-blue-900 bg-blue-50/60">
                  เงินชดเชยรวม (บาท)
                </th>
                <th className="py-3 px-4 text-right">ยอดส่ง (ถัง)</th>
                <th className="py-3 px-4 text-right text-emerald-800">ต้นทุน (บาท/ถัง)</th>
                <th className="py-3 px-4 text-center">MoM (%)</th>
                <th className="py-3 px-4 text-center w-36">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyData.map((m, idx) => {
                const isPositiveMoM = m.momCompGrowth > 0;
                return (
                  <tr 
                    key={m.key} 
                    onClick={() => onSelectMonth && onSelectMonth(m.key)}
                    className="hover:bg-blue-50/80 active:bg-blue-100/80 transition-all group cursor-pointer"
                    title={`คลิกเพื่อเปิดรายงานสรุปค่าชดเชยประจำเดือน ${m.name}`}
                  >
                    <td className="py-3.5 px-4 text-center tabular-nums text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-blue-700 transition">
                      <span className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-all shadow-2xs">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs group-hover:underline underline-offset-4 font-bold">
                          {m.name}
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center tabular-nums text-slate-600">
                      {m.days}
                    </td>
                    <td className="py-3.5 px-3 text-center tabular-nums font-semibold text-slate-700">
                      {m.driverCount}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-bold text-slate-800">
                      {m.totalKm.toLocaleString('th-TH', { minimumFractionDigits: 1 })}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums text-slate-700">
                      {m.totalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums text-purple-700 font-semibold">
                      ฿{m.avgPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums text-slate-500">
                      ฿{m.avgCompRate.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-extrabold text-blue-900 bg-blue-50/50 text-sm group-hover:bg-blue-100/50 transition">
                      ฿{m.totalComp.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums text-slate-700">
                      {m.totalTanks.toLocaleString('th-TH')}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-bold text-emerald-700">
                      ฿{m.costPerTank.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center tabular-nums font-bold">
                      {idx === 0 ? (
                        <span className="text-slate-300">-</span>
                      ) : (
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] ${
                          isPositiveMoM ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isPositiveMoM ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{Math.abs(m.momCompGrowth)}%</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white rounded-xl text-xs font-bold transition-all shadow-2xs">
                        <Eye className="w-3.5 h-3.5" />
                        <span>เปิดรายงานสรุป</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center">รวมทั้งสิ้นสะสม 8 เดือน (YTD Total)</td>
                <td className="py-4 px-4 text-right tabular-nums text-sm">
                  {ytdTotals.totalKm.toLocaleString('th-TH', { minimumFractionDigits: 1 })} กม.
                </td>
                <td className="py-4 px-4 text-right tabular-nums text-sm">
                  {ytdTotals.totalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-right tabular-nums text-purple-700">
                  ฿{ytdTotals.avgPrice.toFixed(2)} (เฉลี่ย)
                </td>
                <td className="py-4 px-4 text-right tabular-nums">
                  ฿{Math.max(0, ytdTotals.avgPrice - basePrice).toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right tabular-nums text-blue-900 bg-blue-100/70 text-base">
                  ฿{ytdTotals.totalComp.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-right tabular-nums text-sm">
                  {ytdTotals.totalTanks.toLocaleString('th-TH')}
                </td>
                <td className="py-4 px-4 text-right tabular-nums text-emerald-800 text-sm">
                  ฿{ytdTotals.avgCostPerTank.toFixed(2)}
                </td>
                <td colSpan={2} className="py-4 px-4 text-center text-xs text-slate-400">
                  ครบ 8 เดือน
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 🏢 NEW SECTION: 18 BRANCHES MULTI-MONTH PERFORMANCE MATRIX */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Branch Matrix Header & Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                ตารางเปรียบเทียบค่าชดเชยน้ำมันแยกรายสาขา (รวม 18 สาขา)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              เปรียบเทียบระยะทางวิ่ง, ยอดเงินชดเชย, สัดส่วนงบประมาณ (% Share), ยอดส่งสินค้า และต้นทุนต่อถังของทั้ง 18 สาขา
            </p>
          </div>

          {/* Matrix Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Period Selector Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setMatrixPeriod('all')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  matrixPeriod === 'all' 
                    ? 'bg-white text-blue-700 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                สะสมทั้งปี (8 เดือน)
              </button>
              
              <select
                value={matrixPeriod === 'all' ? '' : matrixPeriod}
                onChange={(e) => setMatrixPeriod(e.target.value)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer text-xs focus:outline-none ${
                  matrixPeriod !== 'all' 
                    ? 'bg-white text-blue-700 shadow-xs font-bold' 
                    : 'bg-transparent text-slate-600 hover:text-slate-900 font-semibold'
                }`}
              >
                <option value="" disabled>เลือกเฉพาะเดือน...</option>
                {monthList.map(m => (
                  <option key={m.key} value={m.key}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-400 font-medium">เรียงตาม:</span>
              <select
                value={branchSortBy}
                onChange={(e) => setBranchSortBy(e.target.value)}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="comp">ยอดเงินชดเชยสูงสุด</option>
                <option value="km">ระยะทางรวมสูงสุด</option>
                <option value="tanks">ยอดส่งสินค้าสูงสุด</option>
                <option value="costPerTank">ต้นทุน/ถัง</option>
                <option value="id">รหัสสาขา</option>
              </select>
            </div>

            {/* Branch Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาสาขา, รหัส..."
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 sm:w-48 shadow-2xs"
              />
            </div>

          </div>

        </div>

        {/* 18 Branches Matrix Table */}
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-center w-12">อันดับ</th>
                <th className="py-3 px-4 w-24">รหัสสาขา</th>
                <th className="py-3 px-4 min-w-[150px]">ชื่อสาขา</th>
                <th className="py-3 px-4 text-center w-24">รถวิ่งงาน (คัน)</th>
                <th className="py-3 px-4 text-right">ระยะทางสุทธิ (กม.)</th>
                <th className="py-3 px-4 text-right">น้ำมันใช้จริง (ลิตร)</th>
                <th className="py-3 px-4 text-right font-bold text-blue-900 bg-blue-50/60">
                  เงินชดเชยรวม (บาท)
                </th>
                <th className="py-3 px-4 text-left min-w-[160px]">สัดส่วนงบประมาณ (% Share)</th>
                <th className="py-3 px-4 text-right">ยอดส่งสินค้า (ถัง)</th>
                <th className="py-3 px-4 text-right text-emerald-800">ต้นทุน (บาท/ถัง)</th>
                <th className="py-3 px-4 text-center w-36">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchMatrixData.rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    ไม่พบสาขาที่ตรงกับคำค้นหา
                  </td>
                </tr>
              ) : (
                branchMatrixData.rows.map((b, idx) => {
                  const isTop3 = idx < 3;
                  const isBranchSelected = selectedBranches.includes(b.id);

                  return (
                    <tr 
                      key={b.id} 
                      className={`hover:bg-indigo-50/40 transition-colors ${
                        isBranchSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center tabular-nums">
                        {isTop3 ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            idx === 0 
                              ? 'bg-amber-100 text-amber-800' 
                              : idx === 1 
                              ? 'bg-slate-200 text-slate-800' 
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            #{idx + 1}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {b.id}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.name}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums font-semibold text-slate-700">
                        {b.count} คัน
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-800">
                        {b.km.toLocaleString('th-TH', { minimumFractionDigits: 1 })}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-700">
                        {b.litres.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-extrabold text-blue-900 bg-blue-50/40 text-sm">
                        ฿{b.comp.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      
                      {/* Share Progress Bar */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold tabular-nums text-slate-700">{b.sharePercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, b.sharePercent * 5)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums text-slate-700">
                        {b.tanks > 0 ? b.tanks.toLocaleString('th-TH') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-700">
                        {b.costPerTank > 0 ? `฿${b.costPerTank.toFixed(2)}` : '-'}
                      </td>
                      
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (isBranchSelected) {
                              setSelectedBranches(selectedBranches.filter(id => id !== b.id));
                            } else {
                              handleBranchSelect(b.id);
                            }
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
                            isBranchSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isBranchSelected ? 'กำลังดูสาขานี้' : 'วิเคราะห์สาขานี้'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-slate-100 font-extrabold text-slate-900 sticky bottom-0 border-t-2 border-slate-300">
              <tr>
                <td colSpan={3} className="py-4 px-4 text-center">
                  รวมทั้งสิ้น 18 สาขา ({matrixPeriod === 'all' ? 'สะสม 8 เดือน' : monthList.find(m => m.key === matrixPeriod)?.name})
                </td>
                <td className="py-4 px-4 text-center tabular-nums text-sm">
                  {branchMatrixData.totalVehicles} คัน
                </td>
                <td className="py-4 px-4 text-right tabular-nums text-sm">
                  {branchMatrixData.totalKm.toLocaleString('th-TH', { minimumFractionDigits: 1 })} กม.
                </td>
                <td className="py-4 px-4 text-right tabular-nums text-sm">
                  {branchMatrixData.totalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-right tabular-nums text-blue-900 bg-blue-100/70 text-base">
                  ฿{branchMatrixData.totalComp.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-left tabular-nums text-xs text-blue-700 font-bold">
                  100.0% (งบรวม)
                </td>
                <td className="py-4 px-4 text-right tabular-nums text-sm">
                  {branchMatrixData.totalTanks.toLocaleString('th-TH')}
                </td>
                <td className="py-4 px-4 text-right tabular-nums text-emerald-800 text-sm">
                  ฿{branchMatrixData.totalTanks > 0 ? (branchMatrixData.totalComp / branchMatrixData.totalTanks).toFixed(2) : '-'}
                </td>
                <td className="py-4 px-4 text-center text-xs text-slate-400">
                  ครบ 18 สาขา
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </>
  )}

    </div>
  );
}
