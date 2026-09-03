'use client';

import React, { useState } from 'react';
import { Calculator, RotateCcw, Award, CheckCircle, Info } from 'lucide-react';
import {
  calculateComponentPercentage,
  calculateSimplePercentage,
  CalculationResult
} from '../../services/calculatorService';

export const PercentageCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'component' | 'simple'>('component');

  // Component mode states
  const [theoryMarks, setTheoryMarks] = useState<string>('72');
  const [theoryMax, setTheoryMax] = useState<string>('100');
  const [assignmentMarks, setAssignmentMarks] = useState<string>('85');
  const [assignmentMax, setAssignmentMax] = useState<string>('100');
  const [practicalMarks, setPracticalMarks] = useState<string>('');
  const [practicalMax, setPracticalMax] = useState<string>('');

  // Simple mode states
  const [obtainedMarks, setObtainedMarks] = useState<string>('650');
  const [totalMarks, setTotalMarks] = useState<string>('1000');

  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'component') {
      const res = calculateComponentPercentage({
        theoryMarks: Number(theoryMarks) || 0,
        theoryMaxMarks: Number(theoryMax) || 100,
        assignmentMarks: Number(assignmentMarks) || 0,
        assignmentMaxMarks: Number(assignmentMax) || 100,
        practicalMarks: practicalMarks ? Number(practicalMarks) : 0,
        practicalMaxMarks: practicalMax ? Number(practicalMax) : 0
      });
      setResult(res);
    } else {
      const res = calculateSimplePercentage({
        obtainedMarks: Number(obtainedMarks) || 0,
        totalMarks: Number(totalMarks) || 1000
      });
      setResult(res);
    }
  };

  const handleReset = () => {
    setTheoryMarks('');
    setTheoryMax('100');
    setAssignmentMarks('');
    setAssignmentMax('100');
    setPracticalMarks('');
    setPracticalMax('');
    setObtainedMarks('');
    setTotalMarks('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B3D91] to-[#1557C0] rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-blue-100 backdrop-blur-xs">
          <Calculator className="w-4 h-4 text-blue-200" />
          <span>IGNOU Evaluation Utility</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          IGNOU Percentage Calculator
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Calculate your IGNOU percentage quickly and accurately using your theory, assignment, and practical marks or total obtained score.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center border-b border-slate-200 pb-2">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex">
          <button
            onClick={() => { setActiveTab('component'); setResult(null); }}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'component'
                ? 'bg-white text-[#0B3D91] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Subject / Component Mode (Theory + Assignment)
          </button>
          <button
            onClick={() => { setActiveTab('simple'); setResult(null); }}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'simple'
                ? 'bg-white text-[#0B3D91] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Simple Total Marks Mode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Input Container */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <form onSubmit={handleCalculate} className="space-y-5">
            {activeTab === 'component' ? (
              <>
                {/* Theory Marks */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex justify-between">
                    <span>Theory Marks (Term End Exam)</span>
                    <span className="text-[11px] text-slate-400 font-normal">Standard 70% Weightage</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={theoryMarks}
                        onChange={(e) => setTheoryMarks(e.target.value)}
                        placeholder="Marks Obtained (e.g. 72)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        value={theoryMax}
                        onChange={(e) => setTheoryMax(e.target.value)}
                        placeholder="Max Marks (Default 100)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>

                {/* Assignment Marks */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex justify-between">
                    <span>Assignment Marks</span>
                    <span className="text-[11px] text-slate-400 font-normal">Standard 30% Weightage</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={assignmentMarks}
                        onChange={(e) => setAssignmentMarks(e.target.value)}
                        placeholder="Marks Obtained (e.g. 85)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        value={assignmentMax}
                        onChange={(e) => setAssignmentMax(e.target.value)}
                        placeholder="Max Marks (Default 100)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>

                {/* Practical Marks (Optional) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 flex justify-between">
                    <span>Practical Marks (Optional)</span>
                    <span className="text-[11px] text-slate-400 font-normal">If course has lab/practical</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={practicalMarks}
                        onChange={(e) => setPracticalMarks(e.target.value)}
                        placeholder="Obtained (Optional)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        value={practicalMax}
                        onChange={(e) => setPracticalMax(e.target.value)}
                        placeholder="Max Marks"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Simple Mode */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Total Obtained Marks
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={obtainedMarks}
                      onChange={(e) => setObtainedMarks(e.target.value)}
                      placeholder="e.g. 650"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Total Maximum Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#0B3D91] hover:bg-[#1557C0] text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center space-x-1.5"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate Percentage</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </form>

          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <Info className="w-4 h-4 text-[#2563EB]" />
              <span>IGNOU Evaluation Formula Note:</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Standard IGNOU theory courses assign 70% weightage to Term-End Examination (TEE) marks and 30% weightage to Continuous Assessment (Assignments).
            </p>
          </div>
        </div>

        {/* Result Card Output */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-white rounded-2xl p-6 border-2 border-[#2563EB] shadow-xl space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Calculation Result
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Calculated
                </span>
              </div>

              {/* Big Percentage Display */}
              <div className="text-center py-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100">
                <span className="text-xs text-slate-500 font-semibold block uppercase">
                  Overall Percentage
                </span>
                <span className="text-4xl font-extrabold text-[#0B3D91]">
                  {result.formattedPercentage}
                </span>
                <span className="inline-block mt-2 text-xs font-bold text-[#2563EB] bg-blue-100 px-3 py-1 rounded-full">
                  Grade: {result.grade}
                </span>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Obtained Marks:</span>
                  <span className="font-bold text-slate-900">{result.obtainedMarks}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Total Marks:</span>
                  <span className="font-bold text-slate-900">{result.totalMarks}</span>
                </div>

                {result.weightageBreakdown && (
                  <div className="pt-2 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 block">Applied Weightage:</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                      <div>Theory: <span className="font-semibold text-slate-900">{result.weightageBreakdown.theoryWeight}%</span></div>
                      <div>Assignment: <span className="font-semibold text-slate-900">{result.weightageBreakdown.assignmentWeight}%</span></div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setResult(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
              >
                Calculate Again
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0B3D91] flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Calculation Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Enter your theory and assignment marks on the left and click "Calculate Percentage" to see your complete score summary.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
