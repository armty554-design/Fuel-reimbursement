import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Truck, 
  Fuel, 
  Calendar, 
  Download, 
  Building2, 
  Filter, 
  FileSpreadsheet, 
  Users, 
  Search, 
  Package,
  Layers,
  Info
} from 'lucide-react';
import { 
  calculateDiffPlusTen, 
  calculateDailyCompensation 
} from '../utils/calculations';
import * as XLSX from 'xlsx';

export default function SummaryDashboard({
  branches = [],
  drivers = [],
  selectedMonthKey = '10',
  setSelectedMonthKey,
  monthList = [],
  allMonthRecords = {},
  allFuelPrices = {},
  setAllFuelPrices,
  allDailyOfficial = {},
  allDriverSummaries = {},
  basePrice = 30.0
}) {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'driver'
  const [searchTerm, setSearchTerm] = useState('');

  // Current month definition
  const currentMonth = monthList.find(m => m.key === selectedMonthKey) || 
    monthList[monthList.length - 1] || 
    { key: '10', name: 'ตุลาคม 2569', shortName: 'ต.ค. 2569', days: 31, year: 2026, monthIndex: 9 };
  
  const daysInMonth = currentMonth.days;
  const monthName = currentMonth.name;

  // Month-specific records and fuel prices
  const records = allMonthRecords[selectedMonthKey] || {};
  const fuelPrices = allFuelPrices[selectedMonthKey] || {};
  const officialDaily = allDailyOfficial[selectedMonthKey] || [];
  const officialDrivers = allDriverSummaries[selectedMonthKey] || [];

  // Map of driver details (license plates, etc.) from master drivers list
  const masterDriversMap = useMemo(() => {
    const map = {};
    drivers.forEach(d => {
      map[d.empId] = d;
    });
    return map;
  }, [drivers]);

  // Combine monthly driver summaries with master info
  const combinedDriverList = useMemo(() => {
    if (officialDrivers.length > 0) {
      return officialDrivers.map((od, idx) => {
        const master = masterDriversMap[od.empId] || {};
        return {
          ...od,
          index: idx + 1,
          licensePlate: master.licensePlate || od.licensePlate || '-',
          prefixTitle: master.prefixTitle || '',
          branch: od.branch || master.branch || '10',
          branchName: od.branchName || master.branchName || 'บางพลี'
        };
      });
    }

    // Fallback if month driver summary is not yet pre-parsed
    return drivers.map((d, idx) => ({
      index: idx + 1,
      empId: d.empId,
      vehicleNo: d.vehicleNo,
      licensePlate: d.licensePlate || '-',
      fullName: `${d.prefixTitle || ''}${d.firstName} ${d.lastName}`.trim(),
      branch: d.branch,
      branchName: d.branchName,
      fuelConsumption: d.fuelConsumption || 11.0,
      vehicleType: 'กระบะ 4 ล้อ',
      workingDays: 0,
      totalKm: 0,
      totalLitres: 0,
      totalCompensation: 0,
      deliveryUnits: 0,
      compPerTank: 0
    }));
  }, [officialDrivers, masterDriversMap, drivers]);

  // Filter drivers by branch and search term
  const activeDrivers = useMemo(() => {
    return combinedDriverList.filter(d => {
      const matchBranch = selectedBranch === 'all' || d.branch === selectedBranch;
      const term = searchTerm.trim().toLowerCase();
      const matchSearch = term === '' || 
        d.empId.toLowerCase().includes(term) || 
        d.vehicleNo.toLowerCase().includes(term) || 
        (d.licensePlate && d.licensePlate.toLowerCase().includes(term)) ||
        d.fullName.toLowerCase().includes(term) ||
        (d.branchName && d.branchName.toLowerCase().includes(term));
      return matchBranch && matchSearch;
    });
  }, [combinedDriverList, selectedBranch, searchTerm]);

  // Thai Day of Week Helper
  const getDayOfWeek = (day) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
    const date = new Date(currentMonth.year, currentMonth.monthIndex, day);
    return days[date.getDay()];
  };

  // Helper map for official daily records (for fast lookup)
  const officialDailyMap = useMemo(() => {
    const map = {};
    officialDaily.forEach(od => {
      map[od.day] = od;
    });
    return map;
  }, [officialDaily]);

  // Compute Daily Summary rows
  const dailySummary = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
      const dieselPrice = fuelPrices[day] !== undefined ? fuelPrices[day] : 41.44;
      const compRate = Math.max(0, dieselPrice - basePrice);
      const offDay = officialDailyMap[day];

      // If user selected "all branches", no search term, and fuel price is unchanged, use official sheet totals
      const isOfficialUntouched = selectedBranch === 'all' && searchTerm === '' && offDay;

      if (isOfficialUntouched && dieselPrice === offDay.price) {
        // Count active vehicles from records
        let activeVehicles = 0;
        Object.keys(records).forEach(empId => {
          const rec = records[empId]?.[day];
          if (rec && !isNaN(parseFloat(rec.crm)) && parseFloat(rec.crm) > 0) {
            activeVehicles++;
          }
        });
        if (activeVehicles === 0 && offDay.km > 0) activeVehicles = 340;

        return {
          day,
          dayName: offDay.dayName || getDayOfWeek(day),
          dateStr: offDay.dateStr || `${String(day).padStart(2, '0')}/${selectedMonthKey}/2569`,
          dieselPrice: offDay.price,
          compRate: offDay.compRate,
          totalKm: offDay.km,
          totalLitres: offDay.litres,
          totalCompensation: offDay.comp,
          activeVehicles,
          tanks: offDay.tanks || 0,
          compPerTank: offDay.perTank || 0
        };
      }

      // Dynamic calculation (when filtered by branch, driver, or custom price)
      let totalKm = 0;
      let totalLitres = 0;
      let totalCompensation = 0;
      let activeVehicles = 0;

      activeDrivers.forEach(driver => {
        const rec = records[driver.empId]?.[day] || {};
        const diffVal = calculateDiffPlusTen(rec.crm, rec.history, driver.overridePolicy);
        const kmNum = parseFloat(diffVal);
        if (!isNaN(kmNum) && kmNum > 0) {
          totalKm += kmNum;
          activeVehicles++;
          const comp = calculateDailyCompensation(
            kmNum, 
            dieselPrice, 
            basePrice, 
            driver.fuelConsumption || 11.0
          );
          totalLitres += comp.litresUsed;
          totalCompensation += comp.compensationAmount;
        }
      });

      // Tanks estimation or scaled by branch ratio
      const tanks = offDay?.tanks ? Math.round(offDay.tanks * (activeDrivers.length / (combinedDriverList.length || 1))) : 0;
      const compPerTank = tanks > 0 ? totalCompensation / tanks : 0;

      return {
        day,
        dayName: getDayOfWeek(day),
        dateStr: `${String(day).padStart(2, '0')}/${selectedMonthKey}/2569`,
        dieselPrice,
        compRate,
        totalKm: parseFloat(totalKm.toFixed(1)),
        totalLitres: parseFloat(totalLitres.toFixed(2)),
        totalCompensation: parseFloat(totalCompensation.toFixed(2)),
        activeVehicles,
        tanks,
        compPerTank: parseFloat(compPerTank.toFixed(2))
      };
    });
  }, [daysInMonth, fuelPrices, basePrice, officialDailyMap, selectedBranch, searchTerm, records, activeDrivers, combinedDriverList.length, selectedMonthKey]);

  // Monthly grand totals
  const grandTotalKm = useMemo(() => dailySummary.reduce((acc, cur) => acc + cur.totalKm, 0), [dailySummary]);
  const grandTotalLitres = useMemo(() => dailySummary.reduce((acc, cur) => acc + cur.totalLitres, 0), [dailySummary]);
  const grandTotalCompensation = useMemo(() => dailySummary.reduce((acc, cur) => acc + cur.totalCompensation, 0), [dailySummary]);
  const grandTotalTanks = useMemo(() => dailySummary.reduce((acc, cur) => acc + cur.tanks, 0), [dailySummary]);
  
  const activeDaysWithPrice = dailySummary.filter(d => d.dieselPrice > 0);
  const avgDieselPrice = activeDaysWithPrice.length > 0 
    ? activeDaysWithPrice.reduce((acc, cur) => acc + cur.dieselPrice, 0) / activeDaysWithPrice.length 
    : 41.44;
  
  const avgCompPerTank = grandTotalTanks > 0 ? grandTotalCompensation / grandTotalTanks : 0;

  // Driver summary view calculation
  const driverSummary = useMemo(() => {
    return activeDrivers.map((driver, index) => {
      // If no search filter and fuel price untouched, use official totals if present
      if (driver.totalCompensation > 0 && selectedBranch === driver.branch && searchTerm === '') {
        return {
          ...driver,
          index: index + 1
        };
      }

      // Dynamic driver recalculation
      let totalKm = 0;
      let totalLitres = 0;
      let totalCompensation = 0;
      let workingDays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const rec = records[driver.empId]?.[day] || {};
        const diffVal = calculateDiffPlusTen(rec.crm, rec.history, driver.overridePolicy);
        const kmNum = parseFloat(diffVal);
        const dieselPrice = fuelPrices[day] || 41.44;

        if (!isNaN(kmNum) && kmNum > 0) {
          totalKm += kmNum;
          workingDays++;
          const comp = calculateDailyCompensation(
            kmNum, 
            dieselPrice, 
            basePrice, 
            driver.fuelConsumption || 11.0
          );
          totalLitres += comp.litresUsed;
          totalCompensation += comp.compensationAmount;
        }
      }

      const deliveryUnits = driver.deliveryUnits || 0;
      const compPerTank = deliveryUnits > 0 ? totalCompensation / deliveryUnits : 0;

      return {
        ...driver,
        index: index + 1,
        workingDays: workingDays || driver.workingDays,
        totalKm: parseFloat((totalKm || driver.totalKm).toFixed(1)),
        totalLitres: parseFloat((totalLitres || driver.totalLitres).toFixed(2)),
        totalCompensation: parseFloat((totalCompensation || driver.totalCompensation).toFixed(2)),
        deliveryUnits,
        compPerTank: parseFloat(compPerTank.toFixed(2))
      };
    });
  }, [activeDrivers, daysInMonth, records, fuelPrices, basePrice, selectedBranch, searchTerm]);

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: สรุปรายวัน
    const dailyData = dailySummary.map(d => ({
      'วันที่': d.dateStr,
      'วัน': d.dayName,
      'จำนวนรถวิ่งงาน (คัน)': d.activeVehicles,
      'เลขไมล์สุทธิ DIFF+10% (กม.)': d.totalKm,
      'ปริมาณน้ำมันที่ใช้จริง (ลิตร)': d.totalLitres,
      'ราคาน้ำมัน (บาท/ลิตร)': d.dieselPrice,
      'อัตราค่าชดเชยน้ำมัน (บาท/ลิตร)': d.compRate,
      'ค่าชดเชยน้ำมันรวม (บาท)': d.totalCompensation,
      'ยอดส่ง (ถัง)': d.tanks,
      'ค่าชดเชยน้ำมัน (บาท/ถัง)': d.compPerTank
    }));
    const wsDaily = XLSX.utils.json_to_sheet(dailyData);
    XLSX.utils.book_append_sheet(wb, wsDaily, 'สรุปค่าชดเชยรายวัน');

    // Sheet 2: สรุปรายบุคคล
    const driverData = driverSummary.map(d => ({
      'ลำดับ': d.index,
      'รหัสพนักงาน': d.empId,
      'เบอร์รถ': d.vehicleNo,
      'ทะเบียนรถ': d.licensePlate,
      'ชื่อ-สกุล': d.fullName,
      'สาขา': `${d.branch} - ${d.branchName}`,
      'ประเภทรถ': d.vehicleType || 'กระบะ 4 ล้อ',
      'อัตรากินน้ำมัน (กม./ลิตร)': d.fuelConsumption,
      'จำนวนวันวิ่งงาน': d.workingDays,
      'รวมระยะทาง DIFF+10% (กม.)': d.totalKm,
      'รวมน้ำมันที่ใช้ (ลิตร)': d.totalLitres,
      'รวมเงินชดเชยน้ำมัน (บาท)': d.totalCompensation,
      'ยอดส่ง (ถัง)': d.deliveryUnits,
      'ค่าชดเชยน้ำมัน (บาท/ถัง)': d.compPerTank
    }));
    const wsDriver = XLSX.utils.json_to_sheet(driverData);
    XLSX.utils.book_append_sheet(wb, wsDriver, 'สรุปรายบุคคล');

    XLSX.writeFile(wb, `รายงานสรุปค่าชดเชยน้ำมัน_${monthName}_สาขา_${selectedBranch}.xlsx`);
  };

  const handlePriceChange = (day, newPrice) => {
    if (setAllFuelPrices) {
      setAllFuelPrices(prev => ({
        ...prev,
        [selectedMonthKey]: {
          ...(prev[selectedMonthKey] || {}),
          [day]: parseFloat(newPrice) || 0
        }
      }));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Controls Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Month Selector, Branch Filter & View Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* 📅 Month Selector Dropdown */}
          <div className="flex items-center gap-2 bg-blue-50/90 px-3.5 py-2 rounded-2xl border border-blue-200 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-900">เลือกเดือน:</span>
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="bg-transparent font-bold text-blue-950 text-xs focus:outline-none cursor-pointer"
            >
              {monthList.map(m => (
                <option key={m.key} value={m.key}>
                  {m.name} ({m.days} วัน)
                </option>
              ))}
            </select>
          </div>

          {/* 🏢 Branch Picker */}
          <div className="flex items-center gap-2.5 bg-slate-100/90 px-3.5 py-2 rounded-2xl border border-slate-200">
            <Building2 className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-semibold text-slate-500">สาขา:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">ทุกสาขา (18 สาขา • {combinedDriverList.length} คัน)</option>
              {branches.map(b => {
                const count = combinedDriverList.filter(d => d.branch === b.id).length;
                return (
                  <option key={b.id} value={b.id}>
                    สาขา {b.id} - {b.name} ({count} คัน)
                  </option>
                );
              })}
            </select>
          </div>

          {/* 📑 Toggle Daily vs Driver View */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'daily'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>สรุปรายวัน ({daysInMonth} วัน)</span>
            </button>

            <button
              onClick={() => setActiveTab('driver')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'driver'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>สรุปรายบุคคล / เบอร์รถ</span>
            </button>
          </div>

        </div>

        {/* Search & Export Actions */}
        <div className="flex items-center gap-3">
          {activeTab === 'driver' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหารหัส, เบอร์รถ, ทะเบียน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-100/90 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-56"
              />
            </div>
          )}

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออก Excel</span>
          </button>
        </div>

      </div>

      {/* KPI Cards for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Compensation */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-3xl shadow-lg shadow-blue-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              ยอดชดเชยรวม ({monthName})
            </span>
            <div className="p-2 bg-white/10 text-white rounded-2xl backdrop-blur-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-sm font-semibold text-blue-200">฿</span>
            <span className="text-2xl font-bold tabular-nums">
              {grandTotalCompensation.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-blue-200/80">
            หักลบราคาฐาน ฿{basePrice.toFixed(2)}/ลิตร
          </div>
        </div>

        {/* Card 2: Total Km */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ระยะทางสุทธิ DIFF+10%
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums text-slate-900">
              {grandTotalKm.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs text-slate-400 font-medium">กม.</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            จากรถวิ่งงาน {activeDrivers.length} คัน
          </div>
        </div>

        {/* Card 3: Litres */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ปริมาณน้ำมันที่ใช้จริง
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-2xl">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums text-slate-900">
              {grandTotalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 font-medium">ลิตร</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            คำนวณตามเกณฑ์ กม./ลิตร ของรถ
          </div>
        </div>

        {/* Card 4: Total Delivered Tanks */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ยอดส่งสินค้ารวม
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-2xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums text-slate-900">
              {grandTotalTanks > 0 ? grandTotalTanks.toLocaleString('th-TH') : '-'}
            </span>
            <span className="text-xs text-slate-400 font-medium">ถัง</span>
          </div>
          <div className="mt-2 text-[11px] text-sky-700 font-semibold">
            {avgCompPerTank > 0 ? `เฉลี่ย ฿${avgCompPerTank.toFixed(2)} /ถัง` : 'คิดค่าชดเชยต่อถัง'}
          </div>
        </div>

        {/* Card 5: Avg Diesel Price */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ราคาน้ำมันเฉลี่ย
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-2xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums text-slate-900">
              ฿{avgDieselPrice.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ลิตร</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-600 font-medium">
            อัตราเงินชดเชยเฉลี่ย ฿{Math.max(0, avgDieselPrice - basePrice).toFixed(2)}/ลิตร
          </div>
        </div>

      </div>

      {/* VIEW 1: DAILY SUMMARY TABLE */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                ตารางสรุปค่าชดเชยน้ำมัน ประจำเดือน {monthName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                สรุปยอดรวมรายวันตามโครงสร้างชีตต้นแบบ (สามารถแก้ไขราคาน้ำมันเพื่อจำลองการคำนวณใหม่ได้ทันที)
              </p>
            </div>
            <div className="text-xs tabular-nums font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-200">
              ฐานราคาน้ำมัน: ฿{basePrice.toFixed(2)} /ลิตร
            </div>
          </div>

          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-16">วัน</th>
                  <th className="py-3 px-3 text-center w-28">วันที่ส่ง</th>
                  <th className="py-3 px-3 text-center w-20">รถวิ่ง (คัน)</th>
                  <th className="py-3 px-3 text-right">เลขไมล์สุทธิ DIFF+10% (กม.)</th>
                  <th className="py-3 px-3 text-right">ปริมาณน้ำมัน (ลิตร)</th>
                  <th className="py-3 px-3 text-right w-32">ราคาน้ำมัน (บาท/ลิตร)</th>
                  <th className="py-3 px-3 text-right">อัตราชดเชย (บาท/ลิตร)</th>
                  <th className="py-3 px-3 text-right font-bold text-blue-900 bg-blue-50/50">
                    ค่าชดเชยน้ำมัน (บาท)
                  </th>
                  <th className="py-3 px-3 text-right">ยอดส่ง (ถัง)</th>
                  <th className="py-3 px-3 text-right text-emerald-800">ค่าชดเชย (บาท/ถัง)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailySummary.map(row => {
                  const isSunday = row.dayName === 'อาทิตย์';
                  return (
                    <tr 
                      key={row.day} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSunday ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className={`py-2.5 px-3 text-center font-bold ${
                        isSunday ? 'text-red-600' : 'text-slate-600'
                      }`}>
                        {row.dayName}
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums text-slate-800">
                        {row.dateStr}
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums font-semibold text-slate-700">
                        {row.activeVehicles}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-800">
                        {row.totalKm.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                        {row.totalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={row.dieselPrice}
                          onChange={(e) => handlePriceChange(row.day, e.target.value)}
                          className="w-20 px-2 py-1 text-right tabular-nums font-bold text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                        {row.compRate.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-blue-800 bg-blue-50/30 text-sm">
                        ฿{row.totalCompensation.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                        {row.tanks > 0 ? row.tanks.toLocaleString('th-TH') : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-emerald-700 font-semibold">
                        {row.compPerTank > 0 ? row.compPerTank.toFixed(2) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-extrabold text-slate-900 sticky bottom-0 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={3} className="py-3.5 px-3 text-center">รวมทั้งสิ้นประจำเดือน {monthName}</td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-sm">
                    {grandTotalKm.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} กม.
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-sm">
                    {grandTotalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums">
                    {avgDieselPrice.toFixed(2)} (เฉลี่ย)
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums">
                    {Math.max(0, avgDieselPrice - basePrice).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-blue-900 bg-blue-100/70 text-base">
                    ฿{grandTotalCompensation.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-sm">
                    {grandTotalTanks > 0 ? grandTotalTanks.toLocaleString('th-TH') : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-emerald-800 text-sm">
                    {avgCompPerTank > 0 ? avgCompPerTank.toFixed(2) : '-'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: DRIVER SUMMARY TABLE */}
      {activeTab === 'driver' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                ตารางสรุปค่าชดเชยน้ำมัน รายบุคคลและเบอร์รถ (ประจำเดือน {monthName})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                รวบรวมระยะทางสะสมทั้งเดือน และยอดเงินชดเชยสำหรับส่งฝ่ายบัญชีและการเงิน
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              แสดง {driverSummary.length} คัน
            </div>
          </div>

          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-12">ลำดับ</th>
                  <th className="py-3 px-3 w-20">รหัส</th>
                  <th className="py-3 px-3 w-20">เบอร์รถ</th>
                  <th className="py-3 px-3 w-28">ทะเบียนรถ</th>
                  <th className="py-3 px-3 min-w-[150px]">ชื่อ - นามสกุล</th>
                  <th className="py-3 px-3">สาขา</th>
                  <th className="py-3 px-3 text-center w-24">วันวิ่งงาน</th>
                  <th className="py-3 px-3 text-right">ระยะทางสุทธิ DIFF+10%</th>
                  <th className="py-3 px-3 text-right">ปริมาณน้ำมัน (ลิตร)</th>
                  <th className="py-3 px-3 text-right font-bold text-blue-900 bg-blue-50/50">
                    ยอดเงินชดเชย (บาท)
                  </th>
                  <th className="py-3 px-3 text-right">ยอดส่ง (ถัง)</th>
                  <th className="py-3 px-3 text-right text-emerald-800">ค่าชดเชย (บาท/ถัง)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {driverSummary.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-slate-400">
                      ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  driverSummary.map(row => (
                    <tr key={row.empId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 tabular-nums">
                        {row.index}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums font-bold text-slate-800">
                        {row.empId}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums font-bold text-blue-700">
                        {row.vehicleNo}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-700">
                        {row.licensePlate !== '-' ? (
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                            🚗 {row.licensePlate}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {row.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans">
                        {row.branchName}
                      </td>
                      <td className="py-2.5 px-3 text-center tabular-nums font-semibold text-slate-700">
                        {row.workingDays} วัน
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-800">
                        {row.totalKm.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} กม.
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                        {row.totalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-blue-800 bg-blue-50/30 text-sm">
                        ฿{row.totalCompensation.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                        {row.deliveryUnits > 0 ? row.deliveryUnits.toLocaleString('th-TH') : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-emerald-700 font-semibold">
                        {row.compPerTank > 0 ? row.compPerTank.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-100 font-extrabold text-slate-900 sticky bottom-0 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={7} className="py-3.5 px-3 text-center">รวมทั้งสิ้นประจำเดือน {monthName}</td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-sm">
                    {grandTotalKm.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} กม.
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-sm">
                    {grandTotalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-blue-900 bg-blue-100/70 text-base">
                    ฿{grandTotalCompensation.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-sm">
                    {grandTotalTanks > 0 ? grandTotalTanks.toLocaleString('th-TH') : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right tabular-nums text-emerald-800 text-sm">
                    {avgCompPerTank > 0 ? avgCompPerTank.toFixed(2) : '-'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
