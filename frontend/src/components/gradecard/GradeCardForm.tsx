'use client';

import React, { useState } from 'react';
import { Award, Search, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { PROGRAMMES } from '../../data/mockData';
import { fetchGradeCard, GradeCardResponse } from '../../services/gradeCardService';
import { GradeCardDashboard } from './GradeCardDashboard';

export const GradeCardForm: React.FC = () => {
  const [enrollmentNo, setEnrollmentNo] = useState<string>('2101234567');
  const [programmeCode, setProgrammeCode] = useState<string>('BCA');
  const [dob, setDob] = useState<string>('2002-05-15');
  const [loading, setLoading] = useState<boolean>(false);
  const [gradeCardResult, setGradeCardResult] = useState<GradeCardResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Call decoupled service layer
    const result = await fetchGradeCard(enrollmentNo, programmeCode);
    setGradeCardResult(result);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B3D91] to-[#1557C0] rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-blue-100 backdrop-blur-xs">
          <Award className="w-4 h-4 text-blue-200" />
          <span>Academic Records Verification Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          IGNOU Grade Card Check
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Check your IGNOU academic performance, course-wise marks, completed credits, and grade card summary.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Enrollment Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={enrollmentNo}
                onChange={(e) => setEnrollmentNo(e.target.value)}
                placeholder="e.g. 2101234567 (9-10 digits)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Programme Code <span className="text-red-500">*</span>
              </label>
              <select
                value={programmeCode}
                onChange={(e) => setProgrammeCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                {PROGRAMMES.map((prog) => (
                  <option key={prog.code} value={prog.code}>
                    {prog.code} — {prog.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Date of Birth (Verification)
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-[#0B3D91] hover:bg-[#1557C0] text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Checking Records...' : 'Check Grade Card'}</span>
            </button>

            <a
              href="https://gradecard.ignou.ac.in/gradecard/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center space-x-1"
            >
              <span>Official IGNOU Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </form>

        {/* Clear Integration Status Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official IGNOU Grade Card Verification</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Your grade card will be retrieved from the official IGNOU source when the live backend API integration is connected.
          </p>
          <div className="pt-1 flex items-center space-x-2 text-[11px] text-slate-500 border-t border-slate-200">
            <span className="font-semibold text-slate-700">Official Source:</span>
            <a
              href="https://gradecard.ignou.ac.in/gradecard/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563EB] hover:underline"
            >
              IGNOU Grade Card Portal (gradecard.ignou.ac.in)
            </a>
          </div>
        </div>

        {/* Mandatory Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-normal">
            <span className="font-bold">Disclaimer:</span> We do not modify, generate or manually alter IGNOU academic records. All academic data is subject to verification against official IGNOU university databases.
          </p>
        </div>
      </div>

      {/* Dashboard Output Component */}
      {gradeCardResult && gradeCardResult.data && (
        <GradeCardDashboard response={gradeCardResult} />
      )}
    </div>
  );
};
