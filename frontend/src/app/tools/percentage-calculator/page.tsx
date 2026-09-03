'use client';

import React, { useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';

export default function PercentageCalculatorPage() {
  const [obtainedMarks, setObtainedMarks] = useState<string>('650');
  const [totalMarks, setTotalMarks] = useState<string>('1000');
  const [resultPct, setResultPct] = useState<string | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const obtained = Number(obtainedMarks);
    const total = Number(totalMarks);

    if (total > 0) {
      const pct = (obtained / total) * 100;
      setResultPct(`${pct.toFixed(2)}%`);
    }
  };

  const handleReset = () => {
    setObtainedMarks('');
    setTotalMarks('');
    setResultPct(null);
  };

  return (
    <div className="py-8 px-4 max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">IGNOU Percentage Calculator</h1>
        <p className="text-xs text-slate-600">Calculate your percentage using obtained marks and total marks.</p>
      </div>

      <div className="bg-white border border-slate-300 rounded p-6 shadow-xs space-y-4">
        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Marks Obtained <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={obtainedMarks}
              onChange={(e) => setObtainedMarks(e.target.value)}
              placeholder="e.g. 650"
              className="w-full input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Total Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full input-field"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 btn-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 btn-secondary text-xs font-semibold flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </form>

        {/* Calculated Result Display */}
        {resultPct && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-center space-y-1 animate-in fade-in duration-200">
            <span className="text-xs text-slate-600 font-semibold block uppercase">
              Calculated Percentage
            </span>
            <span className="text-3xl font-extrabold text-[#0b3d91] block">
              {resultPct}
            </span>
            <p className="text-[11px] text-slate-500 pt-1">
              Obtained {obtainedMarks} out of {totalMarks} total marks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
