'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  AlertCircle,
  Award,
  FileText,
  CheckCircle2,
  Clock,
  User,
  BookOpen,
  ExternalLink,
  Download,
  Check,
  ChevronDown,
  Calculator,
  FolderGit2,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  fetchGradeCard,
  downloadMarksReport,
  fetchApiProgrammes,
  fetchApiAssignments,
  GradeCardResponse,
  ApiAssignment
} from '../services/api';
import { IGNOU_PROGRAMMES, ProgrammeOption } from '../lib/programmes';
import { AssignmentFinder } from '../components/AssignmentFinder';
import { AssignmentResults } from '../components/AssignmentResults';

const GRADE_CARD_TYPES = [
  {
    value: 0,
    ignouUrlType: 1,
    defaultCode: 'BCA',
    label: '1. For BCA/MCA/MCA_NEW/MP/MPB/PGDCA/PGDCA_NEW/NEW PROGRAMME MBA/MBF',
    shortLabel: 'Option 1 (BCA/MCA/PGDCA/MBA)'
  },
  {
    value: 1,
    ignouUrlType: 2,
    defaultCode: 'BA',
    label: '2. For BDP/BA/B.COM/B.Sc./ASSO Programmes',
    shortLabel: 'Option 2 (BDP/BA/B.Com/B.Sc)'
  },
  {
    value: 2,
    ignouUrlType: 4,
    defaultCode: 'BAG',
    label: '3. For CBCS Programmes',
    shortLabel: 'Option 3 (CBCS Programmes)'
  },
  {
    value: 3,
    ignouUrlType: 3,
    defaultCode: 'BSCM',
    label: '4. For Other Programmes',
    shortLabel: 'Option 4 (Other Programmes e.g. BSCM)'
  }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'gradecard' | 'assignments'>('gradecard');

  // Grade Card Form State
  const [selectedType, setSelectedType] = useState<number>(3);
  const [programmeCode, setProgrammeCode] = useState<string>('BSCM');
  const [programmeSearch, setProgrammeSearch] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const gradeCardCardRef = useRef<HTMLDivElement>(null);

  const [enrollmentNo, setEnrollmentNo] = useState<string>('');
  const [enrollmentError, setEnrollmentError] = useState<string>('');

  const [allProgrammes, setAllProgrammes] = useState<ProgrammeOption[]>(IGNOU_PROGRAMMES);
  const [isGradeCardLoading, setIsGradeCardLoading] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [gradeCardResult, setGradeCardResult] = useState<GradeCardResponse | null>(null);
  const [gradeCardError, setGradeCardError] = useState<string | null>(null);

  // Assignment Finder State
  const [asgProgramme, setAsgProgramme] = useState<string>('');
  const [asgSession, setAsgSession] = useState<string>('');
  const [isAsgLoading, setIsAsgLoading] = useState<boolean>(false);
  const [asgResults, setAsgResults] = useState<ApiAssignment[] | null>(null);
  const [asgErrorMessage, setAsgErrorMessage] = useState<string | undefined>(undefined);

  // Load backend programmes list
  useEffect(() => {
    async function loadProgrammes() {
      try {
        const data = await fetchApiProgrammes();
        if (data && data.length > 0) {
          const map = new Map<string, ProgrammeOption>();
          IGNOU_PROGRAMMES.forEach(p => map.set(p.code.toUpperCase(), p));
          data.forEach(p => {
            const code = p.code.toUpperCase();
            if (!map.has(code)) {
              map.set(code, { code: p.code, name: p.name, active: true });
            }
          });
          setAllProgrammes(Array.from(map.values()));
        }
      } catch (_e) {
        // Fallback already set
      }
    }
    loadProgrammes();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter programmes based on user search
  const filteredProgrammes = useMemo(() => {
    const q = programmeSearch.trim().toLowerCase();
    if (!q) return allProgrammes;
    return allProgrammes.filter(
      p => p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    );
  }, [allProgrammes, programmeSearch]);

  const handleTypeChange = (typeVal: number) => {
    setSelectedType(typeVal);
    const selectedOption = GRADE_CARD_TYPES.find(t => t.value === typeVal);
    if (selectedOption && !programmeSearch) {
      setProgrammeCode(selectedOption.defaultCode);
    }
  };

  const handleSelectProgramme = (code: string) => {
    setProgrammeCode(code);
    setIsDropdownOpen(false);
    setProgrammeSearch('');
  };

  const handleEnrollmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9a-zA-Z]/g, '');
    setEnrollmentNo(val);
    if (enrollmentError) setEnrollmentError('');
  };

  const handleGradeCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEno = enrollmentNo.trim();
    const cleanProg = programmeCode.trim().toUpperCase();

    if (!cleanEno) {
      setEnrollmentError('Please enter your enrollment number.');
      return;
    }
    if (cleanEno.length < 5) {
      setEnrollmentError('Enrollment number must be at least 5 characters long.');
      return;
    }
    if (!cleanProg) {
      setGradeCardError('Please select a valid IGNOU programme code.');
      return;
    }

    setIsGradeCardLoading(true);
    setGradeCardError(null);
    setGradeCardResult(null);

    try {
      const res = await fetchGradeCard(cleanEno, cleanProg, selectedType);
      if (res.status === 'success') {
        setGradeCardResult(res);
      } else {
        setGradeCardError(
          res.message || 'No Grade Card record found. Please verify your enrollment number, programme code, and group type.'
        );
      }
    } catch (_err) {
      setGradeCardError('Failed to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsGradeCardLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!gradeCardResult) return;
    setIsDownloadingPdf(true);
    const cleanProg = (gradeCardResult.student_info?.programme_code || programmeCode).trim().toUpperCase();
    const cleanEno = (gradeCardResult.student_info?.enrollment_no || enrollmentNo).trim();
    const fallbackFilename = `ignou-marks-report-${cleanProg}-${cleanEno}.pdf`;

    try {
      const success = await downloadMarksReport(gradeCardResult.report_id, gradeCardResult, fallbackFilename);
      if (!success) {
        alert('Could not download marks report. Please try again.');
      }
    } catch (_e) {
      alert('Error downloading marks report.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const officialPortalUrl = useMemo(() => {
    if (gradeCardResult?.student_info?.official_portal_url) {
      return gradeCardResult.student_info.official_portal_url;
    }
    const cleanEno = (gradeCardResult?.student_info?.enrollment_no || enrollmentNo).trim();
    const cleanProg = (gradeCardResult?.student_info?.programme_code || programmeCode).trim().toUpperCase();
    const option = GRADE_CARD_TYPES.find(t => t.value === selectedType);
    const ignouType = option ? option.ignouUrlType : 3;
    return `https://gradecard.ignou.ac.in/view_gradecard.aspx?eno=${encodeURIComponent(cleanEno)}&prog=${encodeURIComponent(cleanProg)}&type=${ignouType}`;
  }, [gradeCardResult, enrollmentNo, programmeCode, selectedType]);

  const currentProgrammeLabel = useMemo(() => {
    const found = allProgrammes.find(p => p.code.toUpperCase() === programmeCode.toUpperCase());
    return found ? `${found.code} — ${found.name}` : programmeCode;
  }, [allProgrammes, programmeCode]);

  const formatCell = (val: any) => {
    if (val === null || val === undefined || val === '' || val === 'None') return '-';
    return String(val);
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

  const scrollToGradeCard = () => {
    setActiveTab('gradecard');
    gradeCardCardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-[#212529]">

      {/* ========================================================================= */}
      {/* 1. ODOO-STYLE HERO SECTION                                               */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-20 overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          
          {/* Main Odoo Headline with Highlighter and Underline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E293B] leading-tight sm:leading-tight">
              All your study resources on{' '}
              <span className="relative inline-block px-3 py-1">
                <span className="absolute inset-0 bg-[#F6BE4F] rounded-lg -rotate-1 transform -z-0"></span>
                <span className="relative z-10 text-slate-950 font-black">one platform.</span>
              </span>
              <br className="hidden sm:inline" />
              <span className="mt-2 block sm:inline">
                Simple, efficient, yet{' '}
                <span className="relative inline-block text-slate-900">
                  <span className="relative z-10 italic">accessible!</span>
                  {/* Playful curved cyan/blue brush underline */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-[#0D6EFD]"
                    viewBox="0 0 140 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8.5C38 3 95 2.5 137 9"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto pt-2">
              Official IGNOU Grade Card portal lookup, programme-specific percentage calculation, and assignments for students across India.
            </p>
          </div>

          {/* Odoo CTA Buttons & Handwritten Arrow */}
          <div className="relative pt-2 pb-2 inline-block">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={scrollToGradeCard}
                className="w-full sm:w-auto px-7 py-3 bg-[#714B67] hover:bg-[#5C3D54] text-white text-sm font-bold rounded-lg shadow-sm transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
              >
                <span>Check Grade Card - It&apos;s free</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('assignments');
                  gradeCardCardRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-3 bg-[#F1F2F4] hover:bg-[#E2E8F0] text-slate-800 text-sm font-semibold rounded-lg transition"
              >
                <span>Find Assignments</span>
              </button>
            </div>

            {/* Handwritten playful annotation arrow in Odoo plum color */}
            <div className="hidden lg:block absolute -right-52 top-1 text-left select-none pointer-events-none">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-10 h-10 text-[#714B67] transform -rotate-12"
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M40 8C30 18 20 28 8 36M8 36L18 36M8 36L12 26" />
                </svg>
                <div className="font-serif italic text-sm font-bold text-[#714B67] leading-tight">
                  100% Free &amp; Open<br />for ALL students
                </div>
              </div>
            </div>
          </div>

          {/* Odoo Announcement Pill */}
          <div className="pt-2">
            <div className="inline-flex items-center space-x-2 bg-white border border-slate-200/90 rounded-full px-4 py-1.5 shadow-2xs text-xs font-medium text-slate-700">
              <span className="text-base leading-none">🇮🇳</span>
              <span className="font-semibold text-slate-800">IGNOU Student Hub</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">Updated Session 2026</span>
              <span className="text-slate-300">•</span>
              <button
                onClick={scrollToGradeCard}
                className="text-[#714B67] hover:underline font-bold flex items-center space-x-0.5"
              >
                <span>Calculate Percentage</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ODOO APP TILES DOCK (Subtle curved background with colorful icon tiles) */}
      {/* ========================================================================= */}
      <section className="bg-slate-50/70 border-t border-b border-slate-200/70 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            
            {/* Tile 1: Grade Card */}
            <button
              onClick={() => {
                setActiveTab('gradecard');
                gradeCardCardRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`p-3.5 sm:p-4 rounded-xl border transition flex flex-col items-center justify-center space-y-2 group shadow-2xs ${
                activeTab === 'gradecard'
                  ? 'bg-white border-[#714B67] ring-2 ring-[#714B67]/20 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center group-hover:scale-105 transition">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 text-center">Grade Card</span>
            </button>

            {/* Tile 2: Assignments */}
            <button
              onClick={() => {
                setActiveTab('assignments');
                gradeCardCardRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`p-3.5 sm:p-4 rounded-xl border transition flex flex-col items-center justify-center space-y-2 group shadow-2xs ${
                activeTab === 'assignments'
                  ? 'bg-white border-[#714B67] ring-2 ring-[#714B67]/20 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#017E84] flex items-center justify-center group-hover:scale-105 transition">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 text-center">Assignments</span>
            </button>

            {/* Tile 3: Question Papers */}
            <Link
              href="/question-papers"
              className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition flex flex-col items-center justify-center space-y-2 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 text-center">Old Papers</span>
            </Link>

            {/* Tile 4: Projects */}
            <Link
              href="/projects"
              className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition flex flex-col items-center justify-center space-y-2 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D6EFD] flex items-center justify-center group-hover:scale-105 transition">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 text-center">Projects</span>
            </Link>

            {/* Tile 5: Percentage Tool */}
            <Link
              href="/tools/percentage-calculator"
              className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition flex flex-col items-center justify-center space-y-2 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 text-center">Calculator</span>
            </Link>

            {/* Tile 6: Model Papers */}
            <Link
              href="/model-papers"
              className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition flex flex-col items-center justify-center space-y-2 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 text-center">Model Papers</span>
            </Link>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ACTIVE APPLICATION CONTAINER (Grade Card / Assignment Finder)         */}
      {/* ========================================================================= */}
      <section ref={gradeCardCardRef} className="py-10 sm:py-14 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">

        {/* Tab: Grade Card & Percentage */}
        {activeTab === 'gradecard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                IGNOU Grade Card &amp; Percentage Calculator
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Retrieve official marks and compute weighted percentage based on official rules.
              </p>
            </div>

            {/* Input Form Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-800">
                  Grade Card Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your student credentials as registered on the official IGNOU portal.
                </p>
              </div>

              <form onSubmit={handleGradeCardSubmit} className="space-y-5" noValidate>
                
                {/* Field A: Grade Card Type */}
                <div className="space-y-1.5">
                  <label htmlFor="landing-gradecard-type" className="block text-xs font-semibold text-slate-700">
                    Grade Card Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="landing-gradecard-type"
                    value={selectedType}
                    onChange={(e) => handleTypeChange(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition"
                  >
                    {GRADE_CARD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Select the option matching your course category.
                  </p>
                </div>

                {/* Field B: Programme Code with Searchable Dropdown */}
                <div className="space-y-1.5" ref={dropdownRef}>
                  <label htmlFor="landing-programme-search" className="block text-xs font-semibold text-slate-700">
                    Programme Code <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      id="landing-programme-search"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition"
                    >
                      <span className="font-semibold text-slate-900 truncate">
                        {currentProgrammeLabel || 'Select or search programme code...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-72 flex flex-col overflow-hidden">
                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="text"
                              value={programmeSearch}
                              onChange={(e) => setProgrammeSearch(e.target.value)}
                              placeholder="Type to search (e.g. BSCM, BCA, BA, BAG, MCA)..."
                              autoFocus
                              className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                            />
                          </div>
                        </div>

                        <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                          {filteredProgrammes.length > 0 ? (
                            filteredProgrammes.map((p) => {
                              const isSelected = p.code.toUpperCase() === programmeCode.toUpperCase();
                              return (
                                <button
                                  key={p.code}
                                  type="button"
                                  onClick={() => handleSelectProgramme(p.code)}
                                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-purple-50 transition ${
                                    isSelected ? 'bg-purple-50/80 font-bold text-[#714B67]' : 'text-slate-700'
                                  }`}
                                >
                                  <div className="truncate pr-2">
                                    <span className="font-mono font-semibold text-slate-900">{p.code}</span>
                                    {p.name && p.name !== `${p.code} Programme` && (
                                      <span className="text-slate-500 font-normal ml-2">— {p.name}</span>
                                    )}
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#714B67] shrink-0" />}
                                </button>
                              );
                            })
                          ) : (
                            <div className="p-4 text-center text-xs text-slate-500">
                              No programmes matching &quot;{programmeSearch}&quot;
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Field C: Enrollment Number */}
                <div className="space-y-1.5">
                  <label htmlFor="landing-enrollment-no" className="block text-xs font-semibold text-slate-700">
                    Enrollment Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="landing-enrollment-no"
                    type="text"
                    value={enrollmentNo}
                    onChange={handleEnrollmentChange}
                    placeholder="Enter 9 or 10-digit enrollment number (e.g. 2633547882)"
                    maxLength={12}
                    className={`w-full bg-white border ${
                      enrollmentError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                    } rounded-md px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition`}
                  />
                  {enrollmentError ? (
                    <p className="text-[11px] text-red-600 font-medium">{enrollmentError}</p>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      Your official 9 or 10-digit enrollment number.
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isGradeCardLoading}
                    className="w-full sm:w-auto min-w-[200px] px-6 py-2.5 bg-[#0D6EFD] hover:bg-[#0B5ED7] disabled:bg-slate-300 text-white text-xs font-semibold rounded-md shadow-xs transition duration-150 flex items-center justify-center space-x-2"
                  >
                    {isGradeCardLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Fetching your IGNOU grade card...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Check Grade Card</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Error Alert */}
            {gradeCardError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start space-x-3 text-amber-900 shadow-xs">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Notice</h3>
                  <p className="text-xs leading-relaxed text-amber-900">{gradeCardError}</p>
                </div>
              </div>
            )}

            {/* Result Area */}
            {gradeCardResult && gradeCardResult.status === 'success' && (
              <div className="space-y-6">

                {/* Result Header */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Grade Card</h3>
                      <p className="text-xs text-slate-500">Official student evaluation records</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs"
                      >
                        <span>View Official Grade Card</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </a>

                      <button
                        onClick={handleDownloadReport}
                        disabled={isDownloadingPdf}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0D6EFD] hover:bg-[#0B5ED7] disabled:bg-slate-300 text-white rounded text-xs font-medium transition shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Marks Report'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/70 border border-slate-200/80 rounded-md p-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Student Name</span>
                      <strong className="text-slate-900 block truncate">{gradeCardResult.student_info?.student_name || '-'}</strong>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Enrollment Number</span>
                      <strong className="text-slate-900 font-mono block">{gradeCardResult.student_info?.enrollment_no || '-'}</strong>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Programme</span>
                      <strong className="text-slate-900 block truncate">
                        {gradeCardResult.student_info?.programme || gradeCardResult.student_info?.programme_code || programmeCode}
                      </strong>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Status / Retrieved Date</span>
                      <span className="text-slate-700 block truncate">
                        {gradeCardResult.student_info?.status_date || gradeCardResult.student_info?.retrieved_on || 'Current'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Percentage Summary */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        CALCULATED PERCENTAGE
                      </span>
                      {gradeCardResult.summary?.overall_percentage !== null && gradeCardResult.summary?.overall_percentage !== undefined ? (
                        <div className="text-3xl sm:text-4xl font-extrabold text-[#0D6EFD] tracking-tight mt-1">
                          {typeof gradeCardResult.summary.overall_percentage === 'number'
                            ? `${gradeCardResult.summary.overall_percentage.toFixed(2)}%`
                            : `${gradeCardResult.summary.overall_percentage}%`}
                        </div>
                      ) : (
                        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2.5 mt-2">
                          Percentage calculation is not currently available for this programme.
                        </div>
                      )}
                    </div>

                    {gradeCardResult.summary?.calculation_method && (
                      <div className="text-left sm:text-right text-[11px] text-slate-500 max-w-xs">
                        <span className="block font-medium text-slate-600">Evaluation Rule</span>
                        <span>{gradeCardResult.summary.calculation_method}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-50 border border-slate-200 rounded p-3">
                      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Courses</span>
                      <span className="text-lg font-bold text-slate-900 block mt-0.5">
                        {gradeCardResult.summary?.total_courses ?? 0}
                      </span>
                    </div>

                    <div className="bg-emerald-50/60 border border-emerald-200 rounded p-3">
                      <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider block">Completed</span>
                      <span className="text-lg font-bold text-emerald-700 block mt-0.5">
                        {gradeCardResult.summary?.completed_courses ?? 0}
                      </span>
                    </div>

                    <div className="bg-amber-50/60 border border-amber-200 rounded p-3">
                      <span className="text-[11px] font-medium text-amber-800 uppercase tracking-wider block">Not Completed</span>
                      <span className="text-lg font-bold text-amber-700 block mt-0.5">
                        {gradeCardResult.summary?.not_completed_courses ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course-wise Performance Table */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Course-wise Performance
                    </h4>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      Scroll horizontally on smaller screens
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-slate-200 min-w-[720px]">
                      <thead className="bg-[#1E293B] text-white font-semibold">
                        <tr>
                          <th className="py-3 px-3.5">Course Code</th>
                          <th className="py-3 px-3.5">Course Title</th>
                          <th className="py-3 px-2.5 text-center">Credits</th>
                          <th className="py-3 px-2.5 text-center">Semester</th>
                          <th className="py-3 px-3 text-center">Assignment</th>
                          <th className="py-3 px-3 text-center">TEE Theory</th>
                          <th className="py-3 px-3 text-center">TEE Practical</th>
                          <th className="py-3 px-3 text-center">Overall Marks</th>
                          <th className="py-3 px-3.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(gradeCardResult.courses || gradeCardResult.course_details || []).map((c, idx) => {
                          const isCompleted = String(c.status || '').toUpperCase() === 'COMPLETED';
                          const courseCode = c.course_code || c.course || '-';
                          const courseTitle = c.course_title || '-';
                          const credits = c.credits !== undefined ? c.credits : '-';
                          const semester = c.semester || '-';
                          const asgn = c.assignment_marks !== undefined ? c.assignment_marks : c.asgn1;
                          const theory = c.tee_theory_marks !== undefined ? c.tee_theory_marks : c.term_end_theory;
                          const practical = c.tee_practical_marks !== undefined ? c.tee_practical_marks : c.term_end_practical;
                          const overall = c.overall_marks !== undefined ? c.overall_marks : c.calculated_score;

                          return (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3.5 font-bold font-mono text-[#0D6EFD]">
                                {courseCode}
                              </td>
                              <td className="py-3 px-3.5 text-slate-700 max-w-[200px] truncate" title={String(courseTitle)}>
                                {formatCell(courseTitle)}
                              </td>
                              <td className="py-3 px-2.5 text-center text-slate-600 font-medium">
                                {formatCell(credits)}
                              </td>
                              <td className="py-3 px-2.5 text-center text-slate-600">
                                {formatCell(semester)}
                              </td>
                              <td className="py-3 px-3 text-center font-medium text-slate-800">
                                {formatCell(asgn)}
                              </td>
                              <td className="py-3 px-3 text-center font-medium text-slate-800">
                                {formatCell(theory)}
                              </td>
                              <td className="py-3 px-3 text-center font-medium text-slate-800">
                                {formatCell(practical)}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-slate-900">
                                {formatCell(overall)}
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                {isCompleted ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>COMPLETED</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock className="w-3 h-3" />
                                    <span>NOT COMPLETED</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">
                      Report compiled by IGNOU Student Hub • Developed by{' '}
                      <a
                        href="https://qurashi.tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#714B67] font-semibold hover:underline"
                      >
                        Majid Qurashi
                      </a>
                    </span>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <a
                        href={officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs"
                      >
                        <span>View Official Grade Card</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </a>

                      <button
                        onClick={handleDownloadReport}
                        disabled={isDownloadingPdf}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-[#0D6EFD] hover:bg-[#0B5ED7] disabled:bg-slate-300 text-white rounded text-xs font-medium transition shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Marks Report'}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* Tab: Assignment Finder */}
        {activeTab === 'assignments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8">
              <AssignmentFinder
                onSubmit={handleAssignmentSubmit}
                isLoading={isAsgLoading}
              />
            </div>

            {isAsgLoading && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600 text-xs shadow-xs">
                Searching official IGNOU assignment repositories...
              </div>
            )}

            {!isAsgLoading && asgResults && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                <AssignmentResults
                  assignments={asgResults}
                  programme={asgProgramme}
                  session={asgSession}
                  errorMessage={asgErrorMessage}
                />
              </div>
            )}
          </div>
        )}

      </section>

    </div>
  );
}
