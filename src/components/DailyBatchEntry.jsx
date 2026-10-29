import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  Fuel, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Clock,
  Layers,
  ShieldCheck,
  Check,
  Tag,
  Edit2,
  X,
  FileText
} from 'lucide-react';
import { 
  calculateCompPercentage, 
  calculateDiffPlusTen, 
  calculateDailyCompensation, 
  SPECIAL_STATUSES 
} from '../utils/calculations';

export default function DailyBatchEntry({
  selectedBranch,
  setSelectedBranch,
  branches,
  drivers,
  setDrivers,
  records,
  setRecords,
  fuelPrices,
  setFuelPrices,
  daysInMonth = 31,
  basePrice = 30.0,
  monthName = 'ตุลาคม 2569'
}) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'pending' | 'completed' | 'alert'
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);

  const getDayInfo = (day) => {
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const date = new Date(2026, 9, day);
    const dayName = dayNames[date.getDay()];
    const isSunday = date.getDay() === 0;
    return { dayName, isSunday };
  };

  const { dayName, isSunday } = getDayInfo(selectedDay);
  const currentDieselPrice = fuelPrices[selectedDay] || 41.44;

  const currentBranchInfo = branches.find(b => b.id === selectedBranch);

  // Filter drivers for selected branch & search
  const branchDrivers = drivers.filter(d => {
    const matchBranch = selectedBranch === 'all' || d.branch === selectedBranch;
    const matchSearch = searchTerm === '' || 
      d.empId.includes(searchTerm) || 
      d.vehicleNo.includes(searchTerm) || 
      (d.licensePlate && d.licensePlate.includes(searchTerm)) ||
      d.firstName.includes(searchTerm) || 
      d.lastName.includes(searchTerm);
    return matchBranch && matchSearch;
  });

  const handleValueChange = (empId, field, val) => {
    setRecords(prev => {
      const empRec = prev[empId] || {};
      const dayRec = empRec[selectedDay] || { crm: '', history: '', tripReport: '', deliveryUnits: 0 };
      return {
        ...prev,
        [empId]: {
          ...empRec,
          [selectedDay]: {
            ...dayRec,
            [field]: val
          }
        }
      };
    });
  };

  const handleQuickStatus = (empId, status) => {
    handleValueChange(empId, 'crm', status);
    handleValueChange(empId, 'history', status);
    handleValueChange(empId, 'tripReport', status);
  };

  const handleApplyAllStatus = (status) => {
    if (window.confirm(`ต้องการใส่สถานะ "${status}" ให้พนักงานทุกคนในสาขานี้สำหรับวันที่ ${selectedDay} ใช่หรือไม่?`)) {
      setRecords(prev => {
        const next = { ...prev };
        branchDrivers.forEach(d => {
          const empRec = next[d.empId] || {};
          const dayRec = empRec[selectedDay] || {};
          next[d.empId] = {
            ...empRec,
            [selectedDay]: {
              ...dayRec,
              crm: status,
              history: status,
              tripReport: status
            }
          };
        });
        return next;
      });
    }
  };

  const handleUpdatePrice = (day, newPrice) => {
    const val = parseFloat(newPrice);
    if (!isNaN(val) && val >= 0) {
      setFuelPrices(prev => ({
        ...prev,
        [day]: val
      }));
    }
  };

  // KPI Calculations
  let dayTotalKm = 0;
  let dayTotalLitres = 0;
  let dayTotalCompensation = 0;
  let dayActiveVehicles = 0;
  let completedCount = 0;
  let alertCount = 0;

  branchDrivers.forEach(d => {
    const rec = records[d.empId]?.[selectedDay] || {};
    const finalDiff = calculateDiffPlusTen(rec.crm, rec.history, d.overridePolicy);
    const compPct = calculateCompPercentage(rec.crm, rec.history);
    const km = parseFloat(finalDiff);
    
    if (rec.crm || rec.history || rec.tripReport) {
      completedCount++;
    }

    const diffNum = parseInt(compPct);
    if (compPct && Math.abs(diffNum) > 10) {
      alertCount++;
    }

    if (!isNaN(km) && km > 0) {
      dayTotalKm += km;
      dayActiveVehicles++;
      const comp = calculateDailyCompensation(km, currentDieselPrice, basePrice, d.fuelConsumption || 11.0);
      dayTotalLitres += comp.litresUsed;
      dayTotalCompensation += comp.compensationAmount;
    }
  });

  // Filter based on filterMode
  const displayedDrivers = branchDrivers.filter(d => {
    const rec = records[d.empId]?.[selectedDay] || {};
    const isCompleted = Boolean(rec.crm || rec.history || rec.tripReport);
    const compPct = calculateCompPercentage(rec.crm, rec.history);
    const isAlert = compPct && Math.abs(parseInt(compPct)) > 10;

    if (filterMode === 'pending') return !isCompleted;
    if (filterMode === 'completed') return isCompleted;
    if (filterMode === 'alert') return isAlert;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Premium Glass Header & Controls */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/70 shadow-sm transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Branch Pill Selector */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                เลือกศูนย์กระจายสินค้า / สาขา
              </span>
              <div className="relative mt-0.5">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="appearance-none bg-slate-100 hover:bg-slate-200/70 transition font-bold text-slate-900 text-lg rounded-xl pl-3.5 pr-9 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">ทุกสาขา ({drivers.length} คัน)</option>
                  {branches.map(b => {
                    const count = drivers.filter(d => d.branch === b.id).length;
                    return (
                      <option key={b.id} value={b.id}>
                        สาขา {b.id} - {b.name} ({count} คัน)
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Date Navigator & Daily Fuel Price Quick Edit */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Pill */}
            <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-md shadow-slate-900/10">
              <button
                onClick={() => setSelectedDay(prev => Math.max(1, prev - 1))}
                disabled={selectedDay <= 1}
                className="p-1.5 hover:bg-white/10 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="วันก่อนหน้า"
              >
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>

              <div className="text-center px-3 min-w-[140px]">
                <div className="text-sm font-bold tracking-tight">
                  {dayName}ที่ {selectedDay} {monthName}
                </div>
                <div className="text-[11px] text-blue-300/90 tabular-nums mt-0.5">
                  วันที่ {selectedDay}/{monthName.includes('ตุลาคม') ? '10' : '01'}/2569
                </div>
              </div>

              <button
                onClick={() => setSelectedDay(prev => Math.min(daysInMonth, prev + 1))}
                disabled={selectedDay >= daysInMonth}
                className="p-1.5 hover:bg-white/10 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="วันถัดไป"
              >
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Daily Fuel Price Pill */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 px-3 py-2 rounded-2xl shadow-xs">
              <div className="p-1.5 bg-amber-500 text-white rounded-xl shadow-xs">
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <span>ราคาน้ำมันดีเซลวันนี้</span>
                  <button 
                    onClick={() => setIsFuelModalOpen(true)}
                    className="text-amber-700 hover:text-amber-900 underline text-[10px] font-medium"
                  >
                    (ดูทั้งเดือน)
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs font-bold text-amber-900">฿</span>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelPrices[selectedDay] || ''}
                    onChange={(e) => handleUpdatePrice(selectedDay, e.target.value)}
                    placeholder="41.44"
                    className="w-20 px-1.5 py-0.5 tabular-nums font-extrabold text-sm text-amber-900 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-center shadow-2xs"
                  />
                  <span className="text-[11px] text-amber-800 font-medium">/ลิตร</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, เบอร์รถ, ทะเบียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56 transition font-medium"
            />
          </div>
        </div>

        {/* Date Selector Timeline Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const { dayName: dName, isSunday: isSun } = getDayInfo(day);
            const isCurrent = day === selectedDay;
            const price = fuelPrices[day] || 41.44;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 py-1.5 rounded-2xl transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-300'
                    : isSun
                    ? 'bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                <span className="text-[9px] opacity-75 font-normal">{dName.slice(0, 2)}</span>
                <span className="text-sm tabular-nums font-bold leading-tight">{day}</span>
                <span className={`text-[8px] tabular-nums leading-none mt-0.5 ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                  {price.toFixed(1)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Overview Cards with Modern Aesthetic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Vehicles */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm relative overflow-hidden group hover:border-blue-400/60 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              รถผู้ประกอบการวิ่งงานวันนี้
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-slate-900">{dayActiveVehicles}</span>
            <span className="text-xs text-slate-400 font-medium">/ {branchDrivers.length} คัน</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>กรอกแล้ว {completedCount} คัน</span>
          </div>
        </div>

        {/* Card 2: Total Kilometers */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm relative overflow-hidden group hover:border-emerald-400/60 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ระยะทางสุทธิ (DIFF+10%)
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-emerald-800">
              {dayTotalKm.toLocaleString('th-TH', { minimumFractionDigits: 1 })}
            </span>
            <span className="text-xs text-slate-400 font-medium">กิโลเมตร</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            คลาดเคลื่อนเกิน 10%: <strong className="text-amber-600 tabular-nums">{alertCount}</strong> คัน
          </div>
        </div>

        {/* Card 3: Litres */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm relative overflow-hidden group hover:border-amber-400/60 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ปริมาณน้ำมันที่ใช้
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-slate-900">
              {dayTotalLitres.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 font-medium">ลิตร</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-medium">
            อัตราสิ้นเปลืองมาตรฐาน 11.0 กม./ลิตร
          </div>
        </div>

        {/* Card 4: Daily Compensation */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg shadow-blue-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              เงินชดเชยวันนี้
            </span>
            <div className="p-2.5 bg-white/10 text-white rounded-2xl backdrop-blur-md">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-xs text-blue-200">฿</span>
            <span className="text-2xl font-bold tabular-nums">
              {dayTotalCompensation.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-200/80 tabular-nums flex items-center justify-between">
            <span>อัตราชดเชย: ฿{(currentDieselPrice - basePrice).toFixed(2)}/ลิตร</span>
            <span className="text-[10px] bg-blue-500/40 px-1.5 py-0.5 rounded">เกิน 30 บ.</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Batch Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({branchDrivers.length})
          </button>
          <button
            onClick={() => setFilterMode('alert')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterMode === 'alert'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>ต่างเกิน 10%</span>
            {alertCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded-full font-bold">
                {alertCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterMode === 'pending'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ยังไม่ลงข้อมูล ({branchDrivers.length - completedCount})
          </button>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">คีย์สถานะทั้งสาขา:</span>
          <button
            onClick={() => handleApplyAllStatus('NO')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
          >
            ตั้ง NO ทั้งหมด (วันอาทิตย์)
          </button>
          <button
            onClick={() => handleApplyAllStatus('ไม่มีงาน')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
          >
            ตั้ง ไม่มีงาน ทั้งหมด
          </button>
        </div>
      </div>

      {/* Clean Premium Driver Cards List */}
      <div className="space-y-3">
        {displayedDrivers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8" />
            </div>
            <div className="font-bold text-slate-700 text-base">ไม่พบรายการที่ตรงกับเงื่อนไข</div>
            <div className="text-xs text-slate-400 mt-1">ลองเปลี่ยนตัวกรอง หรือค้นหาด้วยคำอื่น</div>
          </div>
        ) : (
          displayedDrivers.map((driver, idx) => {
            const dayRec = records[driver.empId]?.[selectedDay] || { crm: '', history: '', tripReport: '' };
            const crmVal = dayRec.crm || '';
            const histVal = dayRec.history || '';
            const tripVal = dayRec.tripReport || '';

            const compPct = calculateCompPercentage(crmVal, histVal);
            const finalDiff = calculateDiffPlusTen(crmVal, histVal, driver.overridePolicy);
            const isSpecial = SPECIAL_STATUSES.includes(finalDiff);

            const comp = calculateDailyCompensation(
              finalDiff,
              currentDieselPrice,
              basePrice,
              driver.fuelConsumption || 11.0
            );

            const diffNum = parseInt(compPct);
            const isExceed10 = compPct && Math.abs(diffNum) > 10;
            const isFilled = Boolean(crmVal || histVal || tripVal);

            return (
              <div 
                key={driver.empId}
                className={`bg-white rounded-2xl p-4 border transition-all duration-150 ${
                  isExceed10 
                    ? 'border-amber-300 shadow-sm bg-gradient-to-r from-amber-50/20 via-white to-white' 
                    : isFilled 
                    ? 'border-slate-200 shadow-sm hover:border-slate-300' 
                    : 'border-slate-200/70 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  
                  {/* Left: Driver Identity & Contractor License Plate */}
                  <div className="flex items-center gap-3 min-w-[260px]">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 tabular-nums font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums font-bold text-blue-700 text-sm">
                          {driver.vehicleNo}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {driver.prefixTitle ? `${driver.prefixTitle}` : ''}{driver.firstName} {driver.lastName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums flex items-center gap-2 mt-0.5">
                        <span>รหัส {driver.empId}</span>
                        {driver.licensePlate && (
                          <>
                            <span>•</span>
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-sans text-[10px] font-medium border border-slate-200">
                              🚗 {driver.licensePlate}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-slate-400 font-sans">{driver.branchName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Triple Input (CRM, GPS History, รายงานค่าเที่ยวรถ) + Quick Status Buttons */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    {/* 1. CRM Input */}
                    <div className="flex items-center gap-1 bg-blue-50/60 p-1 rounded-xl border border-blue-100">
                      <span className="text-[10px] font-semibold text-blue-900 px-1.5">1. CRM</span>
                      <input
                        type="text"
                        placeholder="ไมล์รูปถ่าย"
                        value={crmVal}
                        onChange={(e) => handleValueChange(driver.empId, 'crm', e.target.value)}
                        className="w-20 sm:w-22 h-7 px-1.5 text-center tabular-nums font-bold text-xs bg-white text-slate-900 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      />
                    </div>

                    {/* 2. GPS History Input */}
                    <div className="flex items-center gap-1 bg-emerald-50/60 p-1 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-semibold text-emerald-900 px-1.5">2. GPS</span>
                      <input
                        type="text"
                        placeholder="ไมล์ GPS"
                        value={histVal}
                        onChange={(e) => handleValueChange(driver.empId, 'history', e.target.value)}
                        className="w-20 sm:w-22 h-7 px-1.5 text-center tabular-nums font-bold text-xs bg-white text-emerald-900 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                      />
                    </div>

                    {/* 3. รายงานค่าเที่ยวรถ (Trip Report) Input */}
                    <div className="flex items-center gap-1 bg-purple-50/60 p-1 rounded-xl border border-purple-100">
                      <span className="text-[10px] font-semibold text-purple-900 px-1.5 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-purple-600" />
                        <span>3. ค่าเที่ยว</span>
                      </span>
                      <input
                        type="text"
                        placeholder="รายงานค่าเที่ยว"
                        value={tripVal}
                        onChange={(e) => handleValueChange(driver.empId, 'tripReport', e.target.value)}
                        className="w-20 sm:w-22 h-7 px-1.5 text-center tabular-nums font-bold text-xs bg-white text-purple-900 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                      />
                    </div>

                    {/* Quick Status Pill Buttons */}
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                      {['ไม่จด', 'NO', 'ลา', 'ไม่มีงาน', 'ไมล์เสีย'].map(st => (
                        <button
                          key={st}
                          onClick={() => handleQuickStatus(driver.empId, st)}
                          className={`px-1.5 py-0.5 text-[10px] font-medium rounded-lg transition ${
                            crmVal === st
                              ? 'bg-slate-800 text-white shadow-xs font-bold'
                              : 'text-slate-600 hover:bg-slate-200/70'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Automated Calculation & Result */}
                  <div className="flex items-center justify-between xl:justify-end gap-4 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                    
                    {/* Diff % */}
                    <div className="text-center min-w-[65px]">
                      <div className="text-[9px] text-slate-400 font-semibold uppercase">ส่วนต่าง</div>
                      <div className="mt-0.5 tabular-nums text-xs font-bold">
                        {compPct ? (
                          <span className={`px-2 py-0.5 rounded-full inline-block ${
                            isExceed10 ? 'bg-amber-100 text-amber-800 font-extrabold' : 'text-slate-600'
                          }`}>
                            {compPct}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </div>
                    </div>

                    {/* DIFF. + 10% */}
                    <div className="text-center min-w-[85px] bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80">
                      <div className="text-[9px] text-slate-400 font-semibold uppercase">DIFF. + 10%</div>
                      <div className="mt-0.5 tabular-nums text-xs font-bold text-blue-900">
                        {isSpecial ? (
                          <span className="text-slate-600 font-normal">{finalDiff}</span>
                        ) : finalDiff ? (
                          <span>{parseFloat(finalDiff).toFixed(1)} <span className="text-[9px] font-normal text-slate-400">กม.</span></span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </div>
                    </div>

                    {/* Total Compensation in THB */}
                    <div className="text-right min-w-[85px]">
                      <div className="text-[9px] text-slate-400 font-semibold uppercase">เงินชดเชย</div>
                      <div className="mt-0.5 tabular-nums text-xs sm:text-sm font-bold text-blue-700">
                        {comp.compensationAmount > 0 ? (
                          <span>฿{comp.compensationAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-300">฿0.00</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Fuel Price Modal - Manage all 31 days */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-white rounded-xl">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">จัดการราคาน้ำมันดีเซลรายวัน (บาท/ลิตร)</h3>
                  <p className="text-xs text-slate-500">ประจำเดือน {monthName} (สามารถแก้ไขเพื่อคำนวณเงินชดเชยใหม่ได้ทันที)</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFuelModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const { dayName: dName, isSunday: isSun } = getDayInfo(day);
                  const p = fuelPrices[day] || 41.44;
                  return (
                    <div 
                      key={day} 
                      className={`p-2.5 rounded-2xl border transition ${
                        day === selectedDay 
                          ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-100' 
                          : isSun 
                          ? 'border-red-200 bg-red-50/30' 
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-semibold ${isSun ? 'text-red-600' : 'text-slate-600'}`}>
                          {dName} {day}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {day === selectedDay ? '• วันที่เลือก' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs tabular-nums text-slate-400">฿</span>
                        <input
                          type="number"
                          step="0.01"
                          value={p}
                          onChange={(e) => handleUpdatePrice(day, e.target.value)}
                          className="w-full px-2 py-1 text-center tabular-nums font-bold text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                * ราคาน้ำมันจะถูกนำไปหักลบกับราคาฐาน 30.00 บาท เพื่อคิดเป็นอัตราเงินชดเชย
              </div>
              <button
                onClick={() => setIsFuelModalOpen(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                บันทึกและปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
