import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  HelpCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  calculateCompPercentage, 
  calculateDiffPlusTen, 
  SPECIAL_STATUSES 
} from '../utils/calculations';

export default function DailyEntryTable({ 
  selectedBranch, 
  setSelectedBranch, 
  branches, 
  drivers, 
  setDrivers, 
  records, 
  setRecords, 
  daysInMonth = 31,
  monthName = 'ตุลาคม 2569'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState(null); // { empId, day, type }
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    empId: '',
    vehicleNo: '',
    firstName: '',
    lastName: '',
    branch: selectedBranch || '10',
    fuelConsumption: 11.0,
    overridePolicy: 'auto'
  });

  // Filter drivers by branch and search
  const filteredDrivers = drivers.filter(d => {
    const matchBranch = selectedBranch === 'all' || d.branch === selectedBranch;
    const matchSearch = searchTerm === '' || 
      d.empId.includes(searchTerm) || 
      d.vehicleNo.includes(searchTerm) || 
      d.firstName.includes(searchTerm) || 
      d.lastName.includes(searchTerm);
    return matchBranch && matchSearch;
  });

  const handleCellChange = (empId, day, type, value) => {
    setRecords(prev => {
      const empRecords = prev[empId] || {};
      const dayRecord = empRecords[day] || { crm: '', history: '', tripReport: '', deliveryUnits: 0 };
      return {
        ...prev,
        [empId]: {
          ...empRecords,
          [day]: {
            ...dayRecord,
            [type]: value
          }
        }
      };
    });
  };

  const setQuickStatus = (status) => {
    if (!selectedCell) return;
    const { empId, day } = selectedCell;
    handleCellChange(empId, day, 'crm', status);
    handleCellChange(empId, day, 'history', status);
    handleCellChange(empId, day, 'tripReport', status);
  };

  const handleAddDriver = (e) => {
    e.preventDefault();
    if (!newDriver.empId || !newDriver.vehicleNo || !newDriver.firstName) {
      alert('กรุณากรอกรหัสพนักงาน เบอร์รถ และชื่อ');
      return;
    }
    const branchInfo = branches.find(b => b.id === newDriver.branch);
    const driverToAdd = {
      ...newDriver,
      branchName: branchInfo ? branchInfo.name : newDriver.branch
    };
    setDrivers(prev => [...prev, driverToAdd]);
    setIsAddDriverModalOpen(false);
    setNewDriver({
      empId: '',
      vehicleNo: '',
      firstName: '',
      lastName: '',
      branch: selectedBranch === 'all' ? '10' : selectedBranch,
      fuelConsumption: 11.0,
      overridePolicy: 'auto'
    });
  };

  const handleDeleteDriver = (empId) => {
    if (window.confirm(`ยืนยันการลบข้อมูลพนักงานรหัส ${empId} หรือไม่?`)) {
      setDrivers(prev => prev.filter(d => d.empId !== empId));
    }
  };

  const handlePolicyChange = (empId, policy) => {
    setDrivers(prev => prev.map(d => d.empId === empId ? { ...d, overridePolicy: policy } : d));
  };

  // Helper to compute total diff km for a driver
  const computeDriverTotalDiff = (empId, policy) => {
    const empRecords = records[empId] || {};
    let total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const rec = empRecords[d] || {};
      const diffVal = calculateDiffPlusTen(rec.crm, rec.history, policy);
      const num = parseFloat(diffVal);
      if (!isNaN(num)) total += num;
    }
    return total.toFixed(1);
  };

  const computeDriverTotalCrm = (empId) => {
    const empRecords = records[empId] || {};
    let total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const num = parseFloat(empRecords[d]?.crm);
      if (!isNaN(num)) total += num;
    }
    return Math.round(total);
  };

  const computeDriverTotalHistory = (empId) => {
    const empRecords = records[empId] || {};
    let total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const num = parseFloat(empRecords[d]?.history);
      if (!isNaN(num)) total += num;
    }
    return total.toFixed(1);
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 font-medium">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>สาขา:</span>
            <select 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent border-none font-semibold text-blue-900 focus:outline-none cursor-pointer"
            >
              <option value="all">ทุกสาขา ({drivers.length} คัน)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  สาขา {b.id} - {b.name} ({drivers.filter(d => d.branch === b.id).length} คัน)
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ค้นหารหัส, ชื่อ, เบอร์รถ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>
        </div>

        {/* Quick status bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">สถานะด่วน:</span>
          {SPECIAL_STATUSES.map(st => (
            <button
              key={st}
              onClick={() => setQuickStatus(st)}
              disabled={!selectedCell}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                selectedCell 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 border border-slate-300' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              {st}
            </button>
          ))}

          <button
            onClick={() => setIsAddDriverModalOpen(true)}
            className="ml-2 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มพนักงาน/รถ</span>
          </button>
        </div>
      </div>

      {/* Helper notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>วิธีลงข้อมูล:</strong> พนักงานกรอกเลขไมล์ในแถว <strong>CRM</strong> และ <strong>History</strong> (หรือรายงานค่าเที่ยว) 
            ระบบจะคำนวณแถว <strong>เปรียบเทียบ</strong> และแถว <strong>DIFF. + 10%</strong> ให้โดยอัตโนมัติ 
            (คลิกที่เซลล์แล้วกดปุ่มสถานะด่วนด้านบนได้ทันที)
          </span>
        </div>
        <div className="text-slate-500">
          แสดง {filteredDrivers.length} คน
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="p-2 border border-slate-300 w-10 text-center sticky left-0 bg-slate-100 z-30">ลำดับ</th>
                <th className="p-2 border border-slate-300 w-16 sticky left-10 bg-slate-100 z-30">รหัส</th>
                <th className="p-2 border border-slate-300 w-16 sticky left-24 bg-slate-100 z-30">เบอร์รถ</th>
                <th className="p-2 border border-slate-300 w-28 sticky left-40 bg-slate-100 z-30">ชื่อ-สกุล</th>
                <th className="p-2 border border-slate-300 w-24 text-right">รวม (กม.)</th>
                <th className="p-2 border border-slate-300 w-36 text-center">ประเภทข้อมูล</th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                  <th key={day} className="p-2 border border-slate-300 text-center min-w-[58px]">
                    {day}
                  </th>
                ))}
                <th className="p-2 border border-slate-300 w-16 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + 7} className="text-center py-12 text-slate-400">
                    ไม่พบข้อมูลพนักงานในสาขานี้ กรุณาเพิ่มพนักงานหรือเลือกสาขาอื่น
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver, idx) => {
                  const empRecords = records[driver.empId] || {};
                  const totalDiffKm = computeDriverTotalDiff(driver.empId, driver.overridePolicy);
                  const totalCrmKm = computeDriverTotalCrm(driver.empId);
                  const totalHistKm = computeDriverTotalHistory(driver.empId);

                  return (
                    <React.Fragment key={driver.empId}>
                      {/* Row 1: CRM */}
                      <tr className="hover:bg-slate-50 border-t-2 border-slate-300">
                        <td rowSpan={5} className="p-2 border border-slate-300 text-center font-bold text-slate-600 sticky left-0 bg-white z-10 align-middle">
                          {idx + 1}
                        </td>
                        <td rowSpan={5} className="p-2 border border-slate-300 tabular-nums font-medium sticky left-10 bg-white z-10 align-middle">
                          {driver.empId}
                        </td>
                        <td rowSpan={5} className="p-2 border border-slate-300 font-semibold text-blue-700 sticky left-24 bg-white z-10 align-middle">
                          {driver.vehicleNo}
                        </td>
                        <td rowSpan={5} className="p-2 border border-slate-300 font-medium sticky left-40 bg-white z-10 align-middle">
                          <div>{driver.firstName} {driver.lastName}</div>
                          <div className="text-[10px] text-slate-400">สาขา {driver.branch} - {driver.branchName}</div>
                          <div className="mt-1">
                            <select
                              value={driver.overridePolicy}
                              onChange={(e) => handlePolicyChange(driver.empId, e.target.value)}
                              className="text-[10px] px-1 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none"
                            >
                              <option value="auto">คำนวณ Auto</option>
                              <option value="history">ยึด History</option>
                              <option value="crm">ยึด CRM</option>
                            </select>
                          </div>
                        </td>
                        <td className="p-1 border border-slate-300 text-right tabular-nums font-semibold bg-slate-50 text-slate-700">
                          {totalCrmKm.toLocaleString()}
                        </td>
                        <td className="p-1 border border-slate-300 font-semibold text-slate-700 bg-slate-50 pl-2">
                          CRM (ไมล์ถ่ายรูป)
                        </td>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                          const val = empRecords[day]?.crm || '';
                          const isSelected = selectedCell?.empId === driver.empId && selectedCell?.day === day && selectedCell?.type === 'crm';
                          return (
                            <td key={day} className={`p-0 border border-slate-300 ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}`}>
                              <input
                                type="text"
                                value={val}
                                onFocus={() => setSelectedCell({ empId: driver.empId, day, type: 'crm' })}
                                onChange={(e) => handleCellChange(driver.empId, day, 'crm', e.target.value)}
                                className="w-full h-7 px-1 text-center tabular-nums focus:bg-yellow-50 focus:outline-none text-slate-800"
                              />
                            </td>
                          );
                        })}
                        <td rowSpan={5} className="p-2 border border-slate-300 text-center align-middle">
                          <button
                            onClick={() => handleDeleteDriver(driver.empId)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="ลบข้อมูลพนักงาน"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Row 2: History (GPS) */}
                      <tr className="hover:bg-slate-50">
                        <td className="p-1 border border-slate-300 text-right tabular-nums font-semibold bg-emerald-50 text-emerald-800">
                          {parseFloat(totalHistKm).toLocaleString()}
                        </td>
                        <td className="p-1 border border-slate-300 font-semibold text-emerald-800 bg-emerald-50/70 pl-2">
                          History (GPS ASIA)
                        </td>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                          const val = empRecords[day]?.history || '';
                          const isSelected = selectedCell?.empId === driver.empId && selectedCell?.day === day && selectedCell?.type === 'history';
                          return (
                            <td key={day} className={`p-0 border border-slate-300 ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}`}>
                              <input
                                type="text"
                                value={val}
                                onFocus={() => setSelectedCell({ empId: driver.empId, day, type: 'history' })}
                                onChange={(e) => handleCellChange(driver.empId, day, 'history', e.target.value)}
                                className="w-full h-7 px-1 text-center tabular-nums focus:bg-yellow-50 focus:outline-none text-emerald-900 bg-emerald-50/20"
                              />
                            </td>
                          );
                        })}
                      </tr>

                      {/* Row 3: รายงานค่าเที่ยวรถ */}
                      <tr className="hover:bg-slate-50">
                        <td className="p-1 border border-slate-300 text-right tabular-nums bg-slate-50 text-slate-500">
                          -
                        </td>
                        <td className="p-1 border border-slate-300 text-slate-600 bg-slate-50 pl-2">
                          รายงานค่าเที่ยวรถ
                        </td>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                          const val = empRecords[day]?.tripReport || '';
                          const isSelected = selectedCell?.empId === driver.empId && selectedCell?.day === day && selectedCell?.type === 'tripReport';
                          return (
                            <td key={day} className={`p-0 border border-slate-300 ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}`}>
                              <input
                                type="text"
                                value={val}
                                onFocus={() => setSelectedCell({ empId: driver.empId, day, type: 'tripReport' })}
                                onChange={(e) => handleCellChange(driver.empId, day, 'tripReport', e.target.value)}
                                className="w-full h-7 px-1 text-center tabular-nums focus:bg-yellow-50 focus:outline-none text-slate-600"
                              />
                            </td>
                          );
                        })}
                      </tr>

                      {/* Row 4: เปรียบเทียบ (CRM / History) */}
                      <tr className="bg-slate-50/70">
                        <td className="p-1 border border-slate-300 text-right tabular-nums text-[11px] text-slate-500">
                          -
                        </td>
                        <td className="p-1 border border-slate-300 text-[11px] text-slate-600 pl-2">
                          เปรียบเทียบ (CRM/History)
                        </td>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                          const crmVal = empRecords[day]?.crm;
                          const histVal = empRecords[day]?.history;
                          const compPct = calculateCompPercentage(crmVal, histVal);
                          const num = parseInt(compPct);
                          const isNegative = num < 0;
                          return (
                            <td key={day} className={`p-1 border border-slate-300 text-center tabular-nums text-[10px] ${
                              compPct && Math.abs(num) > 10 ? 'text-amber-600 font-bold bg-amber-50/60' : 'text-slate-500'
                            }`}>
                              {compPct}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Row 5: DIFF. + 10% (Final Calculated Result) */}
                      <tr className="bg-blue-50/40 border-b-2 border-slate-400">
                        <td className="p-1 border border-slate-300 text-right tabular-nums font-bold text-blue-900 bg-blue-100/70">
                          {parseFloat(totalDiffKm).toLocaleString()}
                        </td>
                        <td className="p-1 border border-slate-300 font-bold text-blue-900 bg-blue-100/70 pl-2 flex items-center justify-between">
                          <span>DIFF. + 10% (ชดเชย)</span>
                          {driver.overridePolicy !== 'auto' && (
                            <span className="text-[9px] bg-blue-200 text-blue-800 px-1 rounded">
                              {driver.overridePolicy}
                            </span>
                          )}
                        </td>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                          const crmVal = empRecords[day]?.crm;
                          const histVal = empRecords[day]?.history;
                          const finalDiff = calculateDiffPlusTen(crmVal, histVal, driver.overridePolicy);
                          const isSpecial = SPECIAL_STATUSES.includes(finalDiff);
                          return (
                            <td key={day} className={`p-1 border border-slate-300 text-center tabular-nums font-bold ${
                              isSpecial 
                                ? 'text-slate-500 bg-slate-100 text-[10px]' 
                                : finalDiff 
                                  ? 'text-blue-900 bg-blue-50/60' 
                                  : 'text-slate-300'
                            }`}>
                              {finalDiff || '-'}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Driver Modal */}
      {isAddDriverModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">เพิ่มพนักงานและข้อมูลรถ</h3>
              <button 
                onClick={() => setIsAddDriverModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddDriver} className="p-5 space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">สาขา</label>
                <select
                  value={newDriver.branch}
                  onChange={(e) => setNewDriver({ ...newDriver, branch: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      สาขา {b.id} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">รหัสพนักงาน *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 90806"
                    value={newDriver.empId}
                    onChange={(e) => setNewDriver({ ...newDriver, empId: e.target.value.trim() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">เบอร์รถ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 10101"
                    value={newDriver.vehicleNo}
                    onChange={(e) => setNewDriver({ ...newDriver, vehicleNo: e.target.value.trim() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ชื่อ *</label>
                  <input
                    type="text"
                    required
                    placeholder="ชื่อพนักงาน"
                    value={newDriver.firstName}
                    onChange={(e) => setNewDriver({ ...newDriver, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">นามสกุล</label>
                  <input
                    type="text"
                    placeholder="นามสกุล"
                    value={newDriver.lastName}
                    onChange={(e) => setNewDriver({ ...newDriver, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">อัตรากินน้ำมัน (กม./ลิตร)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDriver.fuelConsumption}
                    onChange={(e) => setNewDriver({ ...newDriver, fuelConsumption: parseFloat(e.target.value) || 11.0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">นโยบายเปรียบเทียบ</label>
                  <select
                    value={newDriver.overridePolicy}
                    onChange={(e) => setNewDriver({ ...newDriver, overridePolicy: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="auto">คำนวณ Auto (Diff 10%)</option>
                    <option value="history">ยึด History ตลอด</option>
                    <option value="crm">ยึด CRM ตลอด</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition"
                >
                  บันทึกพนักงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
