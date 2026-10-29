import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export default function MultiSelectDropdown({
  label,
  icon: Icon,
  options = [], // [{ value, label, subLabel }]
  selectedValues = [], // array of values
  onChange,
  placeholder = 'เลือก...',
  allLabel = 'ทั้งหมด',
  maxDisplay = 2
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      opt.label.toLowerCase().includes(term) ||
      (opt.value && String(opt.value).toLowerCase().includes(term)) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(term))
    );
  });

  const isAllSelected = selectedValues.length === 0 || selectedValues.length === options.length;

  const handleToggle = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    onChange([]); // Empty array represents "All"
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Compute button display text
  const getDisplayText = () => {
    if (isAllSelected) {
      return `${allLabel} (${options.length})`;
    }
    if (selectedValues.length === 1) {
      const match = options.find(o => o.value === selectedValues[0]);
      return match ? match.label : selectedValues[0];
    }
    if (selectedValues.length <= maxDisplay) {
      return selectedValues
        .map(v => {
          const match = options.find(o => o.value === v);
          return match ? (match.shortLabel || match.label) : v;
        })
        .join(', ');
    }
    return `เลือก ${selectedValues.length} รายการ`;
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
          !isAllSelected && selectedValues.length > 0
            ? 'bg-blue-50 text-blue-900 border-blue-300 shadow-2xs'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
      >
        {Icon && <Icon className={`w-4 h-4 ${!isAllSelected ? 'text-blue-600' : 'text-slate-500'}`} />}
        <span className="text-slate-500 font-medium">{label}:</span>
        <span className="font-bold max-w-[160px] truncate text-slate-900">
          {getDisplayText()}
        </span>
        {!isAllSelected && (
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center -ml-1">
            {selectedValues.length}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95">
          {/* Search bar inside dropdown */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`ค้นหา ${label}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action quick buttons */}
          <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`font-semibold cursor-pointer ${
                isAllSelected ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              ✓ เลือกทั้งหมด ({options.length})
            </button>
            {!isAllSelected && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-red-500 hover:text-red-700 font-medium cursor-pointer"
              >
                ล้างที่เลือก
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
            {filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                ไม่พบข้อมูล
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleToggle(opt.value)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {opt.subLabel && (
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {opt.subLabel}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer stats */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>เลือกอยู่: {isAllSelected ? 'ทั้งหมด' : `${selectedValues.length} รายการ`}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-blue-600 hover:text-blue-800 font-bold"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
