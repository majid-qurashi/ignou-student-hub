'use client';

import React, { useState } from 'react';
import { IGNOU_PROGRAMMES } from '../../lib/programmes';
import { SAMPLE_QUESTION_PAPERS, QuestionPaperItem } from '../../lib/data';
import { Search, Download, Eye, CheckCircle } from 'lucide-react';

export default function QuestionPapersPage() {
  const [programme, setProgramme] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [year, setYear] = useState('');
  const [results, setResults] = useState<QuestionPaperItem[] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = SAMPLE_QUESTION_PAPERS.filter((qp) => {
      const matchProg = !programme || qp.programme === programme;
      const matchCourse = !courseCode || qp.courseCode.toLowerCase().includes(courseCode.toLowerCase());
      const matchYear = !year || qp.year === year;
      return matchProg && matchCourse && matchYear;
    });
    setResults(matched.length > 0 ? matched : SAMPLE_QUESTION_PAPERS);
  };

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">IGNOU Previous Year Question Papers</h1>
        <p className="text-xs text-slate-600">Search June and December Term-End Examination question papers.</p>
      </div>

      {/* Form */}
      <div className="bg-white border border-slate-300 rounded p-5 max-w-xl mx-auto space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Programme</label>
            <select
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
              className="w-full input-field"
            >
              <option value="">All Programmes</option>
              {IGNOU_PROGRAMMES.map((p) => (
                <option key={p.code} value={p.code}>{p.code} — {p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Code (Optional)</label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. BCS-011"
                className="w-full input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year (Optional)</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full input-field">
                <option value="">All Years</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-2 btn-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1">
            <Search className="w-4 h-4" />
            <span>Search Question Papers</span>
          </button>
        </form>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white border border-slate-300 rounded p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Available Question Papers ({results.length})
          </h3>
          <div className="divide-y divide-slate-200 border border-slate-200 rounded">
            {results.map((qp) => (
              <div key={qp.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#0b3d91] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mr-2">
                    {qp.courseCode}
                  </span>
                  <span className="font-semibold text-slate-900">{qp.courseName}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Exam: <span className="font-medium text-slate-800">{qp.term} {qp.year}</span> • Programme: {qp.programme}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button onClick={() => alert(`Viewing Question Paper for ${qp.courseCode}...`)} className="px-3 py-1.5 btn-secondary text-xs flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View PYQ</span>
                  </button>

                  {qp.isSolved && (
                    <button onClick={() => alert(`Viewing Solved Solutions for ${qp.courseCode}...`)} className="px-3 py-1.5 btn-primary text-xs flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>View Solution</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
