'use client';

import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { PROGRAMMES } from '../../data/mockData';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedProgramme: string;
  onProgrammeChange: (p: string) => void;
  selectedSemester?: string;
  onSemesterChange?: (s: string) => void;
  selectedType?: string;
  onTypeChange?: (t: string) => void;
  onReset?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedProgramme,
  onProgrammeChange,
  selectedSemester,
  onSemesterChange,
  selectedType,
  onTypeChange,
  onReset
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
          <Filter className="w-4 h-4 text-[#2563EB]" />
          <span>Filter Resources</span>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-[#0B3D91] flex items-center space-x-1 font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Course Code / Subject..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Programme Dropdown */}
        <div>
          <select
            value={selectedProgramme}
            onChange={(e) => onProgrammeChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="">All Programmes (BA, BCom, BCA, etc.)</option>
            {PROGRAMMES.map((prog) => (
              <option key={prog.code} value={prog.code}>
                {prog.code} — {prog.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester / Year Filter (Optional) */}
        {onSemesterChange && (
          <div>
            <select
              value={selectedSemester || ''}
              onChange={(e) => onSemesterChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Years / Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
            </select>
          </div>
        )}

        {/* Resource Type Filter (Optional) */}
        {onTypeChange && (
          <div>
            <select
              value={selectedType || ''}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Resource Types</option>
              <option value="Previous Year">Previous Year</option>
              <option value="Solved Paper">Solved Paper</option>
              <option value="Model Paper">Model Paper</option>
              <option value="Synopsis">Synopsis</option>
              <option value="Full Project Report">Full Project Report</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
