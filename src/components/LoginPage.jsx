import React, { useState } from 'react';
import { 
  Fuel, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Sparkles,
  HelpCircle,
  KeyRound
} from 'lucide-react';

export default function LoginPage({ staffUsers, onLogin }) {
  const [empIdInput, setEmpIdInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = empIdInput.trim();
    if (!cleanId) {
      setErrorMsg('กรุณากรอกรหัสพนักงาน');
      return;
    }

    // Match against staffUsers
    const user = staffUsers.find(u => u.empId === cleanId);
    if (user) {
      setErrorMsg('');
      onLogin(user);
    } else {
      setErrorMsg(`ไม่พบรหัสพนักงาน "${cleanId}" ในฐานข้อมูลแผ่นงานพนักงาน`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4">
      
      {/* Background Decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mx-auto mb-4 border border-white/20">
            <Fuel className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            ระบบบันทึกและคำนวณเงินชดเชยค่าน้ำมัน
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            เข้าสู่ระบบด้วยรหัสพนักงาน (อ้างอิงแผ่นงานพนักงาน)
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                รหัสพนักงาน (Employee ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="เช่น 171904, 171832, 171785"
                  value={empIdInput}
                  onChange={(e) => setEmpIdInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 tabular-nums text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  autoFocus
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium animate-in fade-in">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>เข้าสู่ระบบเพื่อลงข้อมูล</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
