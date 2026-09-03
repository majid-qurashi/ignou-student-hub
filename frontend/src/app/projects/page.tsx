'use client';

import React, { useState } from 'react';
import { IGNOU_PROGRAMMES } from '../../lib/programmes';
import { SAMPLE_PROJECTS, ProjectItem } from '../../lib/data';
import { Search, Eye, Download, FolderKanban, FileText } from 'lucide-react';

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<'Synopsis' | 'Report'>('Synopsis');
  const [programme, setProgramme] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [results, setResults] = useState<ProjectItem[] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = SAMPLE_PROJECTS.filter((p) => {
      const matchType = p.type === activeTab;
      const matchProg = !programme || p.programme === programme;
      const matchCourse = !courseCode || p.courseCode.toLowerCase().includes(courseCode.toLowerCase());
      return matchType && matchProg && matchCourse;
    });
    setResults(matched.length > 0 ? matched : SAMPLE_PROJECTS);
  };

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">IGNOU Project Resources</h1>
        <p className="text-xs text-slate-600">Access project synopsis templates, research reports, and documentation.</p>
      </div>

      {/* Simple 2 Tabs */}
      <div className="flex justify-center border-b border-slate-300">
        <button
          onClick={() => { setActiveTab('Synopsis'); setResults(null); }}
          className={`py-2 px-6 text-xs font-bold transition border-b-2 ${
            activeTab === 'Synopsis'
              ? 'border-[#0b3d91] text-[#0b3d91]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Project Synopsis
        </button>
        <button
          onClick={() => { setActiveTab('Report'); setResults(null); }}
          className={`py-2 px-6 text-xs font-bold transition border-b-2 ${
            activeTab === 'Report'
              ? 'border-[#0b3d91] text-[#0b3d91]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Project Reports
        </button>
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
              placeholder="e.g. BCSP-064"
              className="w-full input-field"
            />
          </div>

          <button type="submit" className="w-full py-2 btn-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1">
            <Search className="w-4 h-4" />
            <span>Search {activeTab}s</span>
          </button>
        </form>
      </div>

      {results && (
        <div className="bg-white border border-slate-300 rounded p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            Available Project {activeTab}s ({results.length})
          </h3>
          <div className="divide-y divide-slate-200 border border-slate-200 rounded">
            {results.map((prj) => (
              <div key={prj.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mr-2">
                    {prj.courseCode}
                  </span>
                  <span className="font-semibold text-slate-900">{prj.title}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Programme: {prj.programme}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button onClick={() => alert(`Viewing ${prj.title}...`)} className="px-3 py-1.5 btn-secondary text-xs flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button onClick={() => alert(`Downloading ${prj.title}...`)} className="px-3 py-1.5 btn-primary text-xs flex items-center space-x-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
