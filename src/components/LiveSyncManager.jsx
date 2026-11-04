import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Wifi, 
  Zap, 
  Clock, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';
import { 
  fetchLiveDailyComp, 
  fetchLiveDriverDiff, 
  SPREADSHEET_ID, 
  SHEET_CONFIG 
} from '../utils/googleSheetsSync';

export default function LiveSyncManager({
  allDailyOfficial,
  setAllDailyOfficial,
  allDriverSummaries,
  setAllDriverSummaries,
  allFuelPrices,
  setAllFuelPrices,
  selectedMonthKey = '10',
  basePrice = 30.0
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => new Date());
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success' | 'error'
  const [autoSyncInterval, setAutoSyncInterval] = useState(30); // in seconds: 10, 30, 60, 0 (disabled)
  const [toastMessage, setToastMessage] = useState(null);
  const [syncCount, setSyncCount] = useState(0);

  const prevCompSums = useRef({});

  // Trigger toast with auto-hide
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // Sync execution
  const executeSync = useCallback(async (isSilent = false) => {
    if (isSyncing) return;
    setIsSyncing(true);
    if (!isSilent) setSyncStatus('syncing');

    try {
      // Sync primary months (active month + 11 + 10 + 01)
      const monthsToSync = Array.from(new Set([selectedMonthKey, '11', '10', '01'].filter(k => SHEET_CONFIG[k])));
      let hasChanges = false;
      let changedMonths = [];

      for (const mKey of monthsToSync) {
        try {
          const compResult = await fetchLiveDailyComp(mKey, basePrice);
          if (compResult && compResult.daily && compResult.daily.length > 0) {
            const newSum = compResult.summary?.totalComp || compResult.daily.reduce((s, r) => s + r.comp, 0);
            const prevSum = prevCompSums.current[mKey];

            if (prevSum !== undefined && Math.abs(prevSum - newSum) > 0.01) {
              hasChanges = true;
              changedMonths.push(SHEET_CONFIG[mKey]?.name || mKey);
            }
            prevCompSums.current[mKey] = newSum;

            // Update daily official state
            setAllDailyOfficial(prev => ({
              ...prev,
              [mKey]: compResult.daily
            }));

            // Update fuel prices state
            if (compResult.prices && Object.keys(compResult.prices).length > 0) {
              setAllFuelPrices(prev => ({
                ...prev,
                [mKey]: compResult.prices
              }));
            }
          }
        } catch (err) {
          console.warn(`Live sync daily comp warning for month ${mKey}:`, err);
        }
      }

      // Also sync active month driver diff if available
      try {
        const diffResult = await fetchLiveDriverDiff(selectedMonthKey);
        if (diffResult && diffResult.drivers && diffResult.drivers.length > 0) {
          setAllDriverSummaries(prev => ({
            ...prev,
            [selectedMonthKey]: diffResult.drivers
          }));
        }
      } catch (diffErr) {
        console.warn(`Live sync driver diff warning:`, diffErr);
      }

      setLastSyncTime(new Date());
      setSyncStatus('success');
      setSyncCount(c => c + 1);

      if (hasChanges) {
        showToast(`✨ ตรวจพบการแก้ไขใน Google Sheets (${changedMonths.join(', ')})! อัปเดตข้อมูลล่าสุดเรียบร้อยแล้ว`);
      } else if (!isSilent) {
        showToast(`✅ ซิงค์ข้อมูลล่าสุดจาก Google Sheets เรียบร้อย (ตรงกัน 100%)`);
      }
    } catch (error) {
      console.error('Live sync error:', error);
      setSyncStatus('error');
      if (!isSilent) {
        showToast(`⚠️ การเชื่อมต่อขัดข้อง: แสดงข้อมูลออฟไลน์ล่าสุด`);
      }
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSyncStatus('idle');
      }, 2500);
    }
  }, [isSyncing, selectedMonthKey, basePrice, setAllDailyOfficial, setAllDriverSummaries, setAllFuelPrices, showToast]);

  // Initial sync on mount
  useEffect(() => {
    executeSync(true);
  }, []);

  // Sync automatically when user switches tabs or focuses the window back
  useEffect(() => {
    const handleFocus = () => {
      // User returned from Google Sheets tab! Sync immediately!
      executeSync(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        executeSync(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [executeSync]);

  // Periodic Auto-Sync Timer
  useEffect(() => {
    if (!autoSyncInterval || autoSyncInterval <= 0) return;

    const intervalId = setInterval(() => {
      executeSync(true);
    }, autoSyncInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoSyncInterval, executeSync]);

  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('th-TH', { hour12: false });
  };

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce shadow-2xl">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl flex items-center gap-3 border border-slate-700/80 shadow-emerald-500/10">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div className="text-xs font-medium leading-relaxed pr-2">
              {toastMessage}
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Real-time Status & Sync Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-4 py-2.5 rounded-2xl border border-blue-900/50 shadow-md mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Live indicator and last update */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isSyncing ? 'duration-300' : ''}`}></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <span>เรียลไทม์ Google Sheets</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-300 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>อัปเดตล่าสุด:</span>
            <span className="text-white font-mono font-bold bg-slate-800/80 px-2 py-0.5 rounded-md">
              {formatTime(lastSyncTime)}
            </span>
            {syncCount > 0 && (
              <span className="text-slate-400 text-[10px] hidden sm:inline">
                (ซิงค์แล้ว {syncCount} ครั้ง)
              </span>
            )}
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Auto-Sync interval selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-xl text-xs">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-[11px] text-slate-300 hidden md:inline">รอบอัปเดต:</span>
            <select
              value={autoSyncInterval}
              onChange={(e) => setAutoSyncInterval(Number(e.target.value))}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value={10} className="bg-slate-900 text-white">⚡ ทุก 10 วิ (เร็วสุด)</option>
              <option value={30} className="bg-slate-900 text-white">⏱️ ทุก 30 วิ (แนะนำ)</option>
              <option value={60} className="bg-slate-900 text-white">🕒 ทุก 1 นาที</option>
              <option value={0} className="bg-slate-900 text-white">⏸️ ปิดอัตโนมัติ</option>
            </select>
          </div>

          {/* Sync Now Button */}
          <button
            onClick={() => executeSync(false)}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs ${
              isSyncing
                ? 'bg-blue-700 text-blue-200 cursor-not-allowed opacity-80'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95'
            }`}
            title="กดเพื่อดึงข้อมูลสดจาก Google Sheets ทันที"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลเดี๋ยวนี้'}</span>
          </button>

          {/* Open Google Sheet Link */}
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
            title="เปิด Google Sheets เพื่อแก้ไขข้อมูลในแท็บใหม่"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">เปิด Google Sheets</span>
          </a>
        </div>
      </div>
    </>
  );
}
