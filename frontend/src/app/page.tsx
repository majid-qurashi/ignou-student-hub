'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchGradeCard, fetchApiProgrammes, GradeCardResponse, fetchApiAssignments, ApiAssignment } from '../services/api';
import { AssignmentFinder } from '../components/AssignmentFinder';
import { AssignmentResults } from '../components/AssignmentResults';
import { Search, AlertCircle, Award, FileText, CheckCircle, Clock, User, BookOpen } from 'lucide-react';

const GRADE_CARD_OPTIONS = [
  { value: 1, label: 'Option 1 — For BCA/MCA/MCA_NEW/MP/MPB/PGDCA/PGDCA_NEW/MBA/MBF' },
  { value: 2, label: 'Option 2 — For BDP/BA/B.COM/B.Sc./ASSO Programmes' },
  { value: 4, label: 'Option 4 — For CBCS Programmes' },
  { value: 3, label: 'Option 3 — For Other Programmes (e.g. BSCM)' },
];

const OPTION_1_CODES = ["BCA", "BCAOL", "BCA_NEW", "BCA_NEWOL", "MBF", "MCA", "MCAOL", "MCA_NEW", "MCA_NEWOL", "MP", "MPB", "PGDCA", "PGDCA_NEW", "PGDHRM", "PGDFM", "PGDOM", "PGDMM", "PGDFMP"];
const OPTION_2_CODES = ["ASSO", "BA", "BCOM", "BDP", "BSC"];
const OPTION_4_CODES = ["BAECH", "BAEGH", "BAG", "BAHDH", "BAHIH", "BAPAH", "BAPCH", "BAPSH", "BASOH", "BAVTM", "BCOMG", "BCOMOL", "BSCANH", "BSCBCH", "BSCG", "BSWG", "BSWGOL"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'gradecard' | 'assignments'>('gradecard');

  // Grade Card State
  const [selectedType, setSelectedType] = useState<number>(3);
  const [programmeCode, setProgrammeCode] = useState<string>('BSCM');
  const [enrollmentNo, setEnrollmentNo] = useState<string>('');
  const [allProgrammes, setAllProgrammes] = useState<{ code: string; name: string }[]>([]);
  
  const [isGradeCardLoading, setIsGradeCardLoading] = useState<boolean>(false);
  const [gradeCardResult, setGradeCardResult] = useState<GradeCardResponse | null>(null);

  // Assignment Finder State
  const [asgProgramme, setAsgProgramme] = useState<string>('');
  const [asgSession, setAsgSession] = useState<string>('');
  const [isAsgLoading, setIsAsgLoading] = useState<boolean>(false);
  const [asgResults, setAsgResults] = useState<ApiAssignment[] | null>(null);
  const [asgErrorMessage, setAsgErrorMessage] = useState<string | undefined>(undefined);

  // Load master programmes from backend API
  useEffect(() => {
    async function loadProgrammes() {
      const data = await fetchApiProgrammes();
      setAllProgrammes(data);
    }
    loadProgrammes();
  }, []);

  const availableProgrammes = useMemo(() => {
    if (selectedType === 1) {
      return OPTION_1_CODES.map(c => ({ code: c, name: `${c} Programme` }));
    } else if (selectedType === 2) {
      return OPTION_2_CODES.map(c => ({ code: c, name: `${c} Programme` }));
    } else if (selectedType === 4) {
      return OPTION_4_CODES.map(c => ({ code: c, name: `${c} Programme` }));
    } else {
      const groupSet = new Set([...OPTION_1_CODES, ...OPTION_2_CODES, ...OPTION_4_CODES]);
      const others = allProgrammes.filter(p => !groupSet.has(p.code));
      if (others.length === 0) {
        return [{ code: 'BSCM', name: 'Bachelor of Science (Mathematics)' }, { code: 'ACFS', name: 'ACFS' }, { code: 'ACISE', name: 'ACISE' }];
      }
      return others;
    }
  }, [selectedType, allProgrammes]);

  const handleGroupChange = (typeVal: number) => {
    setSelectedType(typeVal);
    if (typeVal === 1) {
      setProgrammeCode('BCA');
    } else if (typeVal === 2) {
      setProgrammeCode('BA');
    } else if (typeVal === 4) {
      setProgrammeCode('BAG');
    } else {
      setProgrammeCode('BSCM');
    }
  };

  const handleGradeCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentNo || !programmeCode) {
      setGradeCardResult({
        status: "error",
        message: "Incorrect details provided or Grade Card not found."
      });
      return;
    }

    setIsGradeCardLoading(true);
    setGradeCardResult(null);

    const res = await fetchGradeCard(enrollmentNo.trim(), programmeCode.trim(), selectedType);
    setGradeCardResult(res);
    setIsGradeCardLoading(false);
  };

  const handleAssignmentSubmit = async (programme: string, session: string, course?: string) => {
    setIsAsgLoading(true);
    setAsgProgramme(programme);
    setAsgSession(session);
    setAsgErrorMessage(undefined);

    const res = await fetchApiAssignments(programme, session, course);
    if (res.success) {
      setAsgResults(res.data);
    } else {
      setAsgResults([]);
      setAsgErrorMessage(res.message);
    }

    setIsAsgLoading(false);
  };

  const formatComponents = (s: any) => {
    const parts = [];
    if (s.asgn1 !== undefined && s.asgn1 !== '-' && s.asgn1 > 0) parts.push(`Asgn: ${s.asgn1}`);
    if (s.term_end_theory !== undefined && s.term_end_theory !== '-' && s.term_end_theory > 0) parts.push(`TEE: ${s.term_end_theory}`);
    if (s.lab1 !== undefined && s.lab1 !== '-' && s.lab1 > 0) parts.push(`Lab: ${s.lab1}`);
    if (s.term_end_practical !== undefined && s.term_end_practical !== '-' && s.term_end_practical > 0) parts.push(`Practical: ${s.term_end_practical}`);
    return parts.length > 0 ? parts.join(' | ') : 'Marks Pending';
  };

  return (
    <div className="py-8 px-2 sm:px-4 max-w-5xl mx-auto space-y-8">
      
      {/* Responsive Grade Card CSS Scaffold */}
      <style jsx>{`
        .gc-card { width: 100%; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
        .gc-header { background: #0b3c5d; color: #fff; padding: 12px; font-size: 12px; }
        .gc-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 6px; }
        .gc-score-box { background: #eaf2f8; text-align: center; padding: 10px; border-bottom: 1px solid #d6e4ed; }
        .gc-percentage { font-size: 22px; font-weight: bold; color: #1a5276; }
        .gc-course-list { display: flex; flex-direction: column; gap: 6px; padding: 8px; }
        .gc-course-item { background: #fff; border: 1px solid #e1e8ed; border-radius: 6px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; }
        .gc-course-code { font-weight: bold; font-size: 13px; color: #2c3e50; }
        .gc-components { font-size: 10px; color: #666; margin-top: 2px; }
        .gc-score { font-size: 13px; font-weight: bold; color: #1a5276; text-align: right; }
        .gc-badge { font-size: 9px; font-weight: bold; padding: 2px 5px; border-radius: 3px; display: inline-block; margin-top: 2px; }
        .gc-completed { background: #e8f8f5; color: #27ae60; }
        .gc-pending { background: #fadbd8; color: #c0392b; }
      `}</style>

      {/* Centered Hero Header */}
      <div className="text-center space-y-3">
        <div className="relative w-16 h-16 mx-auto mb-1">
          <Image
            src="/ignou-logo.png"
            alt="IGNOU Emblem"
            fill
            sizes="64px"
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          IGNOU Student Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Official IGNOU Grade Card portal lookup, student header extraction, dynamic component evaluation (Theory, Lab & Project), and official assignments.
        </p>

        {/* Hero Mode Tabs */}
        <div className="flex items-center justify-center space-x-2 pt-2">
          <button
            onClick={() => setActiveTab('gradecard')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'gradecard'
                ? 'bg-[#0b3d91] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Grade Card & Percentage Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'assignments'
                ? 'bg-[#0b3d91] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Assignment Finder</span>
          </button>
        </div>
      </div>

      {activeTab === 'gradecard' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Grade Card Form Card */}
          <div className="bg-white border border-slate-300 rounded-md p-5 sm:p-6 max-w-md mx-auto shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-[#0b3d91]" />
                <span>Check Grade Card & Percentage</span>
              </h2>
            </div>

            <form onSubmit={handleGradeCardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Grade Card Group Option <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => handleGroupChange(Number(e.target.value))}
                  className="w-full input-field cursor-pointer text-xs"
                >
                  {GRADE_CARD_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Programme Code <span className="text-red-500">*</span>
                </label>
                <select
                  value={programmeCode}
                  onChange={(e) => setProgrammeCode(e.target.value)}
                  className="w-full input-field cursor-pointer uppercase text-xs"
                  required
                >
                  <option value="">-- Select Programme Code --</option>
                  {availableProgrammes.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} {p.name && p.name !== `${p.code} Programme` ? `— ${p.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enrollment Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={enrollmentNo}
                  onChange={(e) => setEnrollmentNo(e.target.value)}
                  placeholder="e.g. 2633547882"
                  className="w-full input-field text-xs font-mono"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGradeCardLoading}
                  className="w-full py-2.5 btn-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  {isGradeCardLoading ? (
                    <span>Fetching Grade Card from IGNOU...</span>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Check Grade Card & Compute Percentage</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {gradeCardResult && gradeCardResult.status === 'error' && (
            <div className="bg-amber-50 border border-amber-300 rounded-md p-4 max-w-md mx-auto text-center space-y-1 text-xs text-amber-900 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <h3 className="font-bold text-sm">Notice</h3>
              <p className="text-amber-800 leading-relaxed">
                {gradeCardResult.message || 'Incorrect details provided or Grade Card not found.'}
              </p>
            </div>
          )}

          {/* ADAPTIVE RESULTS DISPLAY */}
          {gradeCardResult && gradeCardResult.status === 'success' && gradeCardResult.student_info && (
            <div>
              {/* MOBILE LAYOUT (< 768px): Card-based Single-Column No-Scroll */}
              <div className="block md:hidden gc-card animate-in fade-in duration-300">
                <div className="gc-header">
                  <div><strong>IGNOU Grade Card Status</strong></div>
                  <div className="gc-meta-grid">
                    <div>Name: <strong>{gradeCardResult.student_info.student_name}</strong></div>
                    <div>Prog: <strong>{gradeCardResult.student_info.program}</strong></div>
                    <div className="col-span-2">Enrolment: <strong className="font-mono">{gradeCardResult.student_info.enrollment_no}</strong></div>
                  </div>
                </div>

                {gradeCardResult.summary && (
                  <div className="gc-score-box">
                    <div className="gc-percentage">
                      {gradeCardResult.summary.overall_percentage}%
                    </div>
                    <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                      Credit-Weighted Overall Percentage ({gradeCardResult.summary.completed_courses} of {gradeCardResult.summary.total_courses} Completed)
                    </div>
                  </div>
                )}

                <div className="gc-course-list">
                  {gradeCardResult.course_details?.map((s, idx) => (
                    <div key={idx} className="gc-course-item">
                      <div>
                        <div className="gc-course-code">{s.course}</div>
                        <div className="gc-components">{formatComponents(s)}</div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div className="gc-score">
                          {typeof s.calculated_score === 'number' ? `${s.calculated_score}%` : s.calculated_score}
                        </div>
                        <div>
                          {s.status === 'COMPLETED' ? (
                            <span className="gc-badge gc-completed">COMPLETED</span>
                          ) : (
                            <span className="gc-badge gc-pending">NOT COMPLETED</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESKTOP / LAPTOP LAYOUT (>= 768px): Wide Descriptive Row-and-Column Table */}
              <div className="hidden md:block bg-white border border-slate-300 rounded-md p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 shadow-xs">
                
                {/* Header Summary */}
                <div className="border-b border-slate-200 pb-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">IGNOU Grade Card — Detailed Report</h2>
                    <span className="text-xs text-slate-500">Group Option {gradeCardResult.student_info.type_group}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-4 h-4 text-[#0b3d91]" />
                      <span>Student Name: <strong className="text-slate-900">{gradeCardResult.student_info.student_name}</strong></span>
                    </div>
                    <div><span className="text-slate-500">Enrolment No:</span> <strong className="font-mono text-slate-900">{gradeCardResult.student_info.enrollment_no}</strong></div>
                    <div><span className="text-slate-500">Programme:</span> <strong className="text-slate-900">{gradeCardResult.student_info.program}</strong></div>
                  </div>
                </div>

                {/* Descriptive Row-and-Column Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>Detailed Component Marks Breakdown</span>
                  </h3>
                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-[#0b3c5d] text-white font-bold">
                        <tr>
                          <th className="p-2.5">COURSE</th>
                          <th className="p-2.5 text-center">Asgn1</th>
                          <th className="p-2.5 text-center">LAB1</th>
                          <th className="p-2.5 text-center">LAB2</th>
                          <th className="p-2.5 text-center">TEE Theory</th>
                          <th className="p-2.5 text-center">TEE Practical</th>
                          <th className="p-2.5 text-center">Component Type</th>
                          <th className="p-2.5 text-center">Weighted Score</th>
                          <th className="p-2.5 text-center">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {gradeCardResult.course_details?.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-[#0b3d91]">{s.course}</td>
                            <td className="p-2.5 text-center">{s.asgn1}</td>
                            <td className="p-2.5 text-center">{s.lab1}</td>
                            <td className="p-2.5 text-center">{s.lab2}</td>
                            <td className="p-2.5 text-center">{s.term_end_theory}</td>
                            <td className="p-2.5 text-center">{s.term_end_practical}</td>
                            <td className="p-2.5 text-center text-[11px] font-mono text-slate-600">{s.evaluated_component_type || 'THEORY'}</td>
                            <td className="p-2.5 text-center font-bold text-[#1a5276]">
                              {typeof s.calculated_score === 'number' ? `${s.calculated_score}%` : s.calculated_score}
                            </td>
                            <td className="p-2.5 text-center font-bold">
                              {s.status === 'COMPLETED' ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>COMPLETED</span>
                                </span>
                              ) : (
                                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>NOT COMPLETED</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Percentage Summary Box */}
                {gradeCardResult.summary && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                      <div>
                        <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Overall Credit-Weighted Percentage</h3>
                        <p className="text-xs text-blue-700">Formula: SUM(Calculated Score * Credits) / SUM(Credits)</p>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-extrabold text-[#0b3d91]">
                          {gradeCardResult.summary.overall_percentage}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-xs pt-1">
                      <div className="bg-white p-2.5 rounded border border-blue-200">
                        <span className="text-slate-500 block">Total Courses</span>
                        <strong className="text-slate-900 text-sm">{gradeCardResult.summary.total_courses}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded border border-blue-200">
                        <span className="text-emerald-600 block">Completed Courses</span>
                        <strong className="text-emerald-700 text-sm">{gradeCardResult.summary.completed_courses}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded border border-blue-200">
                        <span className="text-amber-600 block">Not Completed</span>
                        <strong className="text-amber-700 text-sm">{gradeCardResult.summary.not_completed_courses}</strong>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <AssignmentFinder onSubmit={handleAssignmentSubmit} isLoading={isAsgLoading} />

          {asgResults !== null && (
            <AssignmentResults
              programme={asgProgramme}
              session={asgSession}
              assignments={asgResults}
              errorMessage={asgErrorMessage}
            />
          )}
        </div>
      )}

    </div>
  );
}
