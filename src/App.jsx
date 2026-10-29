import React, { useState, useEffect } from 'react';
import { 
  Fuel, 
  BarChart3, 
  Calendar, 
  LogOut,
  LayoutDashboard,
  FileSpreadsheet
} from 'lucide-react';
import MonthlyExecutiveDashboard from './components/MonthlyExecutiveDashboard';
import SummaryDashboard from './components/SummaryDashboard';
import LoginPage from './components/LoginPage';
import seedData from './data/seedData.json';

const STORAGE_KEY = 'fuel_app_state_v5';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'summary'
  const [selectedBranch, setSelectedBranch] = useState('all');
  
  // App State initialized directly from seedData
  const [branches, setBranches] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_branches`);
      return saved ? JSON.parse(saved) : seedData.branches;
    } catch {
      return seedData.branches;
    }
  });

  const [drivers, setDrivers] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_drivers`);
      return saved ? JSON.parse(saved) : seedData.drivers;
    } catch {
      return seedData.drivers;
    }
  });

  // Selected Month Key: default to '10' (ตุลาคม 2569) or current active
  const [selectedMonthKey, setSelectedMonthKey] = useState('10');
  
  // Dynamic fuel prices dictionary per month
  const [allFuelPrices, setAllFuelPrices] = useState(() => seedData.allFuelPrices || {});

  const staffUsers = seedData.staffUsers || [];
  const monthList = seedData.monthList || [];
  const currentMonth = monthList.find(m => m.key === selectedMonthKey) || monthList[monthList.length - 1];
  const monthName = currentMonth?.name || 'ตุลาคม 2569';

  const [basePrice, setBasePrice] = useState(30.0);
  const [defaultFuelConsumption, setDefaultFuelConsumption] = useState(11.0);

  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(user));
    } catch (e) {
      console.warn('localStorage save error:', e);
    }
    if (user.branch && user.branch !== 'all') {
      setSelectedBranch(user.branch);
    } else {
      setSelectedBranch('all');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(`${STORAGE_KEY}_currentUser`);
    } catch (e) {
      console.warn('localStorage remove error:', e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_branches`, JSON.stringify(branches));
    } catch (e) {
      console.warn('localStorage branches error:', e);
    }
  }, [branches]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_drivers`, JSON.stringify(drivers));
    } catch (e) {
      console.warn('localStorage drivers error:', e);
    }
  }, [drivers]);

  if (!currentUser) {
    return <LoginPage staffUsers={staffUsers} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Clean Premium Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-base text-slate-900 leading-tight">
                  ระบบค่าชดเชยน้ำมัน
                </div>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>8 เดือนย้อนหลัง (มี.ค. – ต.ค. 2569) • 18 สาขา</span>
                </div>
              </div>
            </div>

            {/* Center: Executive Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-2 h-full">
              
              {/* Tab 1: Executive Monthly Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`relative h-full flex items-center gap-2 px-3 sm:px-4 text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">แดชบอร์ดภาพรวมรายเดือน</span>
                <span className="md:hidden">แดชบอร์ด</span>
                {activeTab === 'dashboard' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>

              {/* Tab 2: Detailed Monthly Report */}
              <button
                onClick={() => setActiveTab('summary')}
                className={`relative h-full flex items-center gap-2 px-3 sm:px-4 text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'summary'
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden md:inline">รายงานสรุปค่าชดเชย</span>
                <span className="md:hidden">รายงานสรุป</span>
                {activeTab === 'summary' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            </nav>

            {/* Right: User Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-500">
                  {currentUser.position} • {currentUser.branchName}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">ออกจากระบบ</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Tab 1: Executive Monthly Dashboard */}
        {activeTab === 'dashboard' && (
          <MonthlyExecutiveDashboard
            monthList={monthList}
            allDailyOfficial={seedData.allDailyOfficial}
            allDriverSummaries={seedData.allDriverSummaries}
            allFuelPrices={allFuelPrices}
            branches={branches}
            basePrice={basePrice}
            onSelectMonth={(mKey) => {
              setSelectedMonthKey(mKey);
              setActiveTab('summary');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Tab 2: Detailed Monthly Report with Daily & Driver Breakdown */}
        {activeTab === 'summary' && (
          <SummaryDashboard
            branches={branches}
            drivers={drivers}
            selectedMonthKey={selectedMonthKey}
            setSelectedMonthKey={setSelectedMonthKey}
            monthList={monthList}
            allMonthRecords={seedData.allMonthRecords}
            allFuelPrices={allFuelPrices}
            setAllFuelPrices={setAllFuelPrices}
            allDailyOfficial={seedData.allDailyOfficial}
            allDriverSummaries={seedData.allDriverSummaries}
            basePrice={basePrice}
          />
        )}
      </main>
    </div>
  );
}
