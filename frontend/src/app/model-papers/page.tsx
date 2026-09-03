'use client';

import React, { useState } from 'react';
import { IGNOU_PROGRAMMES } from '../../lib/programmes';
import { SAMPLE_MODEL_PAPERS, ModelPaperItem } from '../../lib/data';
import { Search, Eye } from 'lucide-react';

export default function ModelPapersPage() {
  const [programme, setProgramme] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [results, setResults] = useState<ModelPaperItem[] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = SAMPLE_MODEL_PAPERS.filter((mp) => {
      const matchProg = !programme || mp.programme === programme;
      const matchCourse = !courseCode || mp.courseCode.toLowerCase().includes(courseCode.toLowerCase());
      return matchProg && matchCourse;
    });
    setResults(matched.length > 0 ? matched : SAMPLE_MODEL_PAPERS);
  };

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">IGNOU Exam Model Papers</h1>
        <p className="text-xs text-slate-600">Practice exam-oriented sample model papers for upcoming TEE exams.</p>
      </div>

      <div className="bg-white border border-slate-300 rounded p-5 max-w-xl mx-auto space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Programme</label>
            <select value={programme} onChange={(e) => setProgramme(e.target.value)} className="w-full input-field">
              <option value="">All Programmes</option>
              {IGNOU_PROGRAMMES.map((p) => (
                <option key={p.code} value={p.code}>{p.code} — {p.name}</option>
              ))}
            </select>
          </div>

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

          <button type="submit" className="w-full py-2 btn-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1">
            <Search className="w-4 h-4" />
            <span>Search Model Papers</span>
          </button>
        </form>
      </div>

      {results && (
        <div className="bg-white border border-slate-300 rounded p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Available Model Papers ({results.length})
          </h3>
          <div className="divide-y divide-slate-200 border border-slate-200 rounded">
            {results.map((mp) => (
              <div key={mp.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mr-2">
                    {mp.courseCode}
                  </span>
                  <span className="font-semibold text-slate-900">{mp.courseName}</span>
                </div>

                <button onClick={() => alert(`Opening Model Paper for ${mp.courseCode}...`)} className="px-3 py-1.5 btn-primary text-xs flex items-center space-x-1 shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Model Paper</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
