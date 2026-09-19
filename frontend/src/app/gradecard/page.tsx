'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  AlertCircle,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock,
  User,
  GraduationCap,
  Calendar,
  Hash,
  Download,
  Check,
  ChevronDown
} from 'lucide-react';
import { fetchGradeCard, downloadMarksReport, fetchApiProgrammes, GradeCardResponse } from '../../services/api';
import { IGNOU_PROGRAMMES, ProgrammeOption } from '../../lib/programmes';

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

export default function GradeCardPage() {
  const [selectedType, setSelectedType] = useState<number>(3); // Default to Option 4 (Other - BSCM)
  const [programmeCode, setProgrammeCode] = useState<string>('BSCM');
  const [programmeSearch, setProgrammeSearch] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [enrollmentNo, setEnrollmentNo] = useState<string>('');
  const [enrollmentError, setEnrollmentError] = useState<string>('');

  const [allProgrammes, setAllProgrammes] = useState<ProgrammeOption[]>(IGNOU_PROGRAMMES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [result, setResult] = useState<GradeCardResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load backend programmes list if available to supplement master list
  useEffect(() => {
    async function load() {
      try {
        const apiProgs = await fetchApiProgrammes();
        if (apiProgs && apiProgs.length > 0) {
          const map = new Map<string, ProgrammeOption>();
          IGNOU_PROGRAMMES.forEach(p => map.set(p.code.toUpperCase(), p));
          apiProgs.forEach(p => {
            const code = p.code.toUpperCase();
            if (!map.has(code)) {
              map.set(code, { code: p.code, name: p.name, active: true });
            }
          });
          setAllProgrammes(Array.from(map.values()));
        }
      } catch (_e) {
        // Fallback already set to IGNOU_PROGRAMMES
      }
    }
    load();
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

  // Filter programmes based on user search query
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      setErrorMessage('Please select a valid IGNOU programme code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const response = await fetchGradeCard(cleanEno, cleanProg, selectedType);
      if (response.status === 'success') {
        setResult(response);
      } else {
        setErrorMessage(
          response.message || 'No Grade Card record found. Please verify your enrollment number, programme code, and group type.'
        );
      }
    } catch (_err) {
      setErrorMessage('Failed to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    setIsDownloadingPdf(true);
    const cleanProg = (result.student_info?.programme_code || programmeCode).trim().toUpperCase();
    const cleanEno = (result.student_info?.enrollment_no || enrollmentNo).trim();
    const fallbackFilename = `ignou-marks-report-${cleanProg}-${cleanEno}.pdf`;

    try {
      const success = await downloadMarksReport(result.report_id, result, fallbackFilename);
      if (!success) {
        alert('Could not download marks report. Please try again.');
      }
    } catch (_e) {
      alert('Error downloading marks report.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Construct official IGNOU portal link
  const officialPortalUrl = useMemo(() => {
    if (result?.student_info?.official_portal_url) {
      return result.student_info.official_portal_url;
    }
    const cleanEno = (result?.student_info?.enrollment_no || enrollmentNo).trim();
    const cleanProg = (result?.student_info?.programme_code || programmeCode).trim().toUpperCase();
    const option = GRADE_CARD_TYPES.find(t => t.value === selectedType);
    const ignouType = option ? option.ignouUrlType : 3;
    return `https://gradecard.ignou.ac.in/view_gradecard.aspx?eno=${encodeURIComponent(cleanEno)}&prog=${encodeURIComponent(cleanProg)}&type=${ignouType}`;
  }, [result, enrollmentNo, programmeCode, selectedType]);

  // Selected programme display title
  const currentProgrammeLabel = useMemo(() => {
    const found = allProgrammes.find(p => p.code.toUpperCase() === programmeCode.toUpperCase());
    return found ? `${found.code} — ${found.name}` : programmeCode;
  }, [allProgrammes, programmeCode]);

  // Format cell value: preserve '-' without converting to 0
  const formatCell = (val: any) => {
    if (val === null || val === undefined || val === '' || val === 'None') return '-';
    return String(val);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* 1. PAGE HEADER (Odoo-inspired clean, calm typography) */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            IGNOU Grade Card
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Check your IGNOU grade card and calculate your percentage.
          </p>
        </div>

        {/* 2. INPUT FORM CARD */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-800">
              Grade Card Details
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your student credentials as registered on the official IGNOU portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Field A: Grade Card Type */}
            <div className="space-y-1.5">
              <label htmlFor="gradecard-type" className="block text-xs font-semibold text-slate-700">
                Grade Card Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="gradecard-type"
                  value={selectedType}
                  onChange={(e) => handleTypeChange(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] focus:border-transparent transition"
                >
                  {GRADE_CARD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500">
                Select the option matching your course category.
              </p>
            </div>

            {/* Field B: Programme Code with Live Search */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <label htmlFor="programme-search-input" className="block text-xs font-semibold text-slate-700">
                Programme Code <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  id="programme-search-input"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] focus:border-transparent transition"
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
                          className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]"
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
                              className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition ${
                                isSelected ? 'bg-blue-50/70 font-bold text-[#0D6EFD]' : 'text-slate-700'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <span className="font-mono font-semibold text-slate-900">{p.code}</span>
                                {p.name && p.name !== `${p.code} Programme` && (
                                  <span className="text-slate-500 font-normal ml-2">— {p.name}</span>
                                )}
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#0D6EFD] shrink-0" />}
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
              <label htmlFor="enrollment-number" className="block text-xs font-semibold text-slate-700">
                Enrollment Number <span className="text-red-500">*</span>
              </label>
              <input
                id="enrollment-number"
                type="text"
                value={enrollmentNo}
                onChange={handleEnrollmentChange}
                placeholder="Enter 9 or 10-digit enrollment number (e.g. 2633547882)"
                maxLength={12}
                className={`w-full bg-white border ${
                  enrollmentError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                } rounded-md px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#0D6EFD] focus:border-transparent transition`}
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
                disabled={isLoading}
                className="w-full sm:w-auto min-w-[200px] px-6 py-2.5 bg-[#0D6EFD] hover:bg-[#0B5ED7] disabled:bg-slate-300 text-white text-xs font-semibold rounded-md shadow-xs transition duration-150 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
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

        {/* 3. ERROR ALERT STATE */}
        {errorMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5 flex items-start space-x-3 text-amber-900 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Notice</h3>
              <p className="text-xs leading-relaxed text-amber-900">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 4. RESULT AREA (Only visible after successful retrieval) */}
        {result && result.status === 'success' && (
          <div className="space-y-6">

            {/* A. RESULT HEADER CARD */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Grade Card</h2>
                  <p className="text-xs text-slate-500">Official student evaluation details</p>
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

              {/* Compact Responsive Student Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/70 border border-slate-200/80 rounded-md p-4 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Student Name</span>
                  <strong className="text-slate-900 block truncate">{result.student_info?.student_name || '-'}</strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Enrollment Number</span>
                  <strong className="text-slate-900 font-mono block">{result.student_info?.enrollment_no || '-'}</strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Programme</span>
                  <strong className="text-slate-900 block truncate">
                    {result.student_info?.programme || result.student_info?.programme_code || programmeCode}
                  </strong>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Status / Retrieved Date</span>
                  <span className="text-slate-700 block truncate">
                    {result.student_info?.status_date || result.student_info?.retrieved_on || 'Current'}
                  </span>
                </div>
              </div>
            </div>

            {/* B. PERCENTAGE SUMMARY CARD */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    CALCULATED PERCENTAGE
                  </span>
                  {result.summary?.overall_percentage !== null && result.summary?.overall_percentage !== undefined ? (
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#0D6EFD] tracking-tight mt-1">
                      {typeof result.summary.overall_percentage === 'number'
                        ? `${result.summary.overall_percentage.toFixed(2)}%`
                        : `${result.summary.overall_percentage}%`}
                    </div>
                  ) : (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2.5 mt-2">
                      Percentage calculation is not currently available for this programme.
                    </div>
                  )}
                </div>

                {result.summary?.calculation_method && (
                  <div className="text-left sm:text-right text-[11px] text-slate-500 max-w-xs">
                    <span className="block font-medium text-slate-600">Method</span>
                    <span>{result.summary.calculation_method}</span>
                  </div>
                )}
              </div>

              {/* Course Status Metric Breakdown */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-200 rounded p-3">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Courses</span>
                  <span className="text-lg font-bold text-slate-900 block mt-0.5">
                    {result.summary?.total_courses ?? 0}
                  </span>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 rounded p-3">
                  <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider block">Completed</span>
                  <span className="text-lg font-bold text-emerald-700 block mt-0.5">
                    {result.summary?.completed_courses ?? 0}
                  </span>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 rounded p-3">
                  <span className="text-[11px] font-medium text-amber-800 uppercase tracking-wider block">Not Completed</span>
                  <span className="text-lg font-bold text-amber-700 block mt-0.5">
                    {result.summary?.not_completed_courses ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* C. COURSE PERFORMANCE TABLE */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden space-y-0">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Course-wise Performance
                </h3>
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
                    {(result.courses || result.course_details || []).map((c, idx) => {
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

              {/* Bottom Quick-Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Unofficial report compiled for student reference only.
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
    </div>
  );
}
