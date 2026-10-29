import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Car
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function BranchManagement({
  branches,
  setBranches,
  drivers,
  setDrivers,
  basePrice,
  setBasePrice,
  defaultFuelConsumption,
  setDefaultFuelConsumption
}) {
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id || '10');
  const [newBranch, setNewBranch] = useState({ id: '', name: '' });
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);

  const currentBranchDrivers = drivers.filter(d => d.branch === selectedBranch);

  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!newBranch.id || !newBranch.name) return;
    if (branches.some(b => b.id === newBranch.id)) {
      alert('รหัสสาขานี้มีอยู่แล้ว');
      return;
    }
    setBranches(prev => [...prev, newBranch]);
    setSelectedBranch(newBranch.id);
    setNewBranch({ id: '', name: '' });
    setIsAddBranchOpen(false);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          alert('ไม่พบข้อมูลในไฟล์ Excel');
          return;
        }

        // Map columns
        // Expecting columns: รหัสพนักงาน, เบอร์รถ, ชื่อ, นามสกุล, สาขา, อัตรากินน้ำมัน
        const importedDrivers = [];
        data.forEach(row => {
          const empId = String(row['รหัสพนักงาน'] || row['รหัส'] || row['empId'] || '').trim();
          const vehicleNo = String(row['เบอร์รถ'] || row['vehicleNo'] || '').trim();
          const firstName = String(row['ชื่อ'] || row['firstName'] || '').trim();
          const lastName = String(row['นามสกุล'] || row['lastName'] || '').trim();
          const branch = String(row['สาขา'] || row['branch'] || selectedBranch).trim();
          const fuelConsumption = parseFloat(row['อัตรากินน้ำมัน'] || row['fuelConsumption']) || defaultFuelConsumption;

          if (empId && vehicleNo) {
            const bInfo = branches.find(b => b.id === branch);
            importedDrivers.push({
              empId,
              vehicleNo,
              firstName,
              lastName,
              branch,
              branchName: bInfo ? bInfo.name : branch,
              fuelConsumption,
              overridePolicy: 'auto'
            });
          }
        });

        if (importedDrivers.length > 0) {
          setDrivers(prev => {
            // Merge or replace
            const existingMap = new Map(prev.map(d => [d.empId, d]));
            importedDrivers.forEach(d => existingMap.set(d.empId, d));
            return Array.from(existingMap.values());
          });
          alert(`นำเข้าข้อมูลพนักงานสำเร็จจำนวน ${importedDrivers.length} ราย`);
        } else {
          alert('รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบหัวตาราง (รหัสพนักงาน, เบอร์รถ, ชื่อ, นามสกุล, สาขา)');
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'รหัสพนักงาน': '90806',
        'เบอร์รถ': '10101',
        'ชื่อ': 'อุไรศรี',
        'นามสกุล': 'พรมกสิกร',
        'สาขา': '10',
        'อัตรากินน้ำมัน': 11.0
      },
      {
        'รหัสพนักงาน': '90974',
        'เบอร์รถ': '10102',
        'ชื่อ': 'ธีรยุทธ',
        'นามสกุล': 'พันธุ์พงษ์',
        'สาขา': '10',
        'อัตรากินน้ำมัน': 11.0
      }
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'driver_import_template.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Global Setting Cards */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-600" />
          <span>ตั้งค่าเกณฑ์การคำนวณเงินชดเชยน้ำมัน</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              ฐานราคาน้ำมันมาตรฐาน (บาท/ลิตร)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                className="w-32 px-3 py-1.5 tabular-nums font-bold text-lg bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-500 text-sm">บาท/ลิตร (ชดเชยเมื่อราคาจริงเกินค่านี้)</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              * ค่าตั้งต้นตามระบบคือ 30.00 บาท/ลิตร
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              อัตราสิ้นเปลืองน้ำมันมาตรฐาน (กม./ลิตร)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={defaultFuelConsumption}
                onChange={(e) => setDefaultFuelConsumption(parseFloat(e.target.value) || 11.0)}
                className="w-32 px-3 py-1.5 tabular-nums font-bold text-lg bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-500 text-sm">กิโลเมตรต่อลิตร</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              * สำหรับรถกระบะส่งน้ำดื่มทั่วไป (ปรับแต่งแยกคันได้)
            </p>
          </div>
        </div>
      </div>

      {/* Branch & Driver Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch List */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>รายชื่อสาขา ({branches.length})</span>
            </h4>
            <button
              onClick={() => setIsAddBranchOpen(true)}
              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
              title="เพิ่มสาขาใหม่"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 max-h-[55vh] overflow-y-auto pr-1">
            {branches.map(b => {
              const count = drivers.filter(d => d.branch === b.id).length;
              const isSelected = selectedBranch === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b.id)}
                  className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center tabular-nums font-bold text-[11px] ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {b.id}
                    </span>
                    <span>{b.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count} คัน
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drivers in selected branch */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>พนักงานในสาขา {selectedBranch} ({currentBranchDrivers.length} คน)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                สามารถนำเข้ารหัสพนักงาน เบอร์รถ และชื่อ-สกุลผ่าน Excel ได้ทันที
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>โหลด Template Excel</span>
              </button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>นำเข้า Excel</span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[55vh]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                <tr>
                  <th className="p-2 border border-slate-200 w-12 text-center">ลำดับ</th>
                  <th className="p-2 border border-slate-200 w-20">รหัส</th>
                  <th className="p-2 border border-slate-200 w-20">เบอร์รถ</th>
                  <th className="p-2 border border-slate-200">ชื่อ - สกุล</th>
                  <th className="p-2 border border-slate-200 text-center w-24">อัตรากินน้ำมัน</th>
                  <th className="p-2 border border-slate-200 text-center w-28">นโยบายคิดไมล์</th>
                  <th className="p-2 border border-slate-200 w-16 text-center">ลบ</th>
                </tr>
              </thead>
              <tbody>
                {currentBranchDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      ยังไม่มีพนักงานในสาขานี้ กดปุ่ม "นำเข้า Excel" หรือเพิ่มพนักงานในหน้าลงข้อมูล
                    </td>
                  </tr>
                ) : (
                  currentBranchDrivers.map((driver, idx) => (
                    <tr key={driver.empId} className="hover:bg-slate-50 border-b border-slate-200">
                      <td className="p-2 border border-slate-200 text-center text-slate-400">{idx + 1}</td>
                      <td className="p-2 border border-slate-200 tabular-nums font-medium">{driver.empId}</td>
                      <td className="p-2 border border-slate-200 font-bold text-blue-700">{driver.vehicleNo}</td>
                      <td className="p-2 border border-slate-200 font-medium">{driver.firstName} {driver.lastName}</td>
                      <td className="p-2 border border-slate-200 text-center tabular-nums">{driver.fuelConsumption} กม./ลิตร</td>
                      <td className="p-2 border border-slate-200 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          driver.overridePolicy === 'auto' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          driver.overridePolicy === 'history' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {driver.overridePolicy === 'auto' ? 'Auto (Diff 10%)' :
                           driver.overridePolicy === 'history' ? 'ยึด History' : 'ยึด CRM'}
                        </span>
                      </td>
                      <td className="p-2 border border-slate-200 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`ต้องการลบพนักงาน ${driver.firstName} หรือไม่?`)) {
                              setDrivers(prev => prev.filter(d => d.empId !== driver.empId));
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Branch Modal */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">เพิ่มสาขาใหม่</h3>
              <button onClick={() => setIsAddBranchOpen(false)} className="text-slate-400 text-xl font-bold leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddBranch} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">รหัสสาขา (เช่น 99)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 99"
                  value={newBranch.id}
                  onChange={(e) => setNewBranch({ ...newBranch, id: e.target.value.trim() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none tabular-nums"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">ชื่อสาขา (เช่น สาขาใหม่)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น หาดใหญ่"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBranchOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
