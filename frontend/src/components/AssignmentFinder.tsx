'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchApiProgrammes, fetchApiSessions, fetchApiCourses } from '../services/api';
import { Search } from 'lucide-react';

interface AssignmentFinderProps {
  onSubmit: (programme: string, session: string, course?: string) => void;
  isLoading?: boolean;
}

export const AssignmentFinder: React.FC<AssignmentFinderProps> = ({ onSubmit, isLoading = false }) => {
  const [programmes, setProgrammes] = useState<{ code: string; name: string; category?: string }[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [courses, setCourses] = useState<{ code: string; name: string }[]>([]);
  
  const [selectedProgramme, setSelectedProgramme] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);

  // Load master programmes from backend API on mount
  useEffect(() => {
    async function loadProgrammes() {
      const data = await fetchApiProgrammes();
      setProgrammes(data);
    }
    loadProgrammes();
  }, []);

  // Group programmes by category
  const groupedProgrammes = useMemo(() => {
    const groups: Record<string, { code: string; name: string }[]> = {
      "Bachelor's Degree": [],
      "Master's Degree": [],
      "PG Diploma": [],
      "Diploma & Certificate": [],
      "Doctoral (PhD)": [],
      "General": []
    };

    programmes.forEach((p) => {
      const cat = p.category || 'General';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(p);
    });

    return groups;
  }, [programmes]);

  // Load sessions when programme changes
  useEffect(() => {
    if (!selectedProgramme) {
      setSessions([]);
      setSelectedSession('');
      setCourses([]);
      setSelectedCourse('');
      return;
    }

    async function loadSessions() {
      setLoadingSessions(true);
      const data = await fetchApiSessions(selectedProgramme);
      setSessions(data);
      setSelectedSession('');
      setCourses([]);
      setSelectedCourse('');
      setLoadingSessions(false);
    }

    loadSessions();
  }, [selectedProgramme]);

  // Load courses when session changes
  useEffect(() => {
    if (!selectedProgramme || !selectedSession) {
      setCourses([]);
      setSelectedCourse('');
      return;
    }

    async function loadCourses() {
      setLoadingCourses(true);
      const data = await fetchApiCourses(selectedProgramme, selectedSession);
      setCourses(data);
      setSelectedCourse('');
      setLoadingCourses(false);
    }

    loadCourses();
  }, [selectedProgramme, selectedSession]);

  const isSessionEnabled = Boolean(selectedProgramme) && !loadingSessions;
  const isCourseEnabled = Boolean(selectedProgramme && selectedSession) && !loadingCourses;
  const isSubmitEnabled = Boolean(selectedProgramme && selectedSession);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitEnabled) {
      onSubmit(selectedProgramme, selectedSession, selectedCourse || undefined);
    }
  };

  return (
    <div className="bg-white border border-slate-300 rounded-md p-5 sm:p-6 max-w-xl mx-auto shadow-xs space-y-4">
      <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
        Find Your IGNOU Assignment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Select Programme */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Select Programme <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedProgramme}
            onChange={(e) => setSelectedProgramme(e.target.value)}
            className="w-full input-field cursor-pointer text-xs"
          >
            <option value="">-- Select Programme --</option>
            {Object.entries(groupedProgrammes).map(([category, items]) => (
              items.length > 0 && (
                <optgroup key={category} label={category}>
                  {items.map((prog) => (
                    <option key={prog.code} value={prog.code}>
                      {prog.code} — {prog.name}
                    </option>
                  ))}
                </optgroup>
              )
            ))}
          </select>
        </div>

        {/* Step 2: Select Session */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Select Session <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            disabled={!isSessionEnabled}
            className="w-full input-field cursor-pointer text-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingSessions ? 'Loading available sessions...' : '-- Select Session --'}
            </option>
            {sessions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {!selectedProgramme && (
            <p className="text-[11px] text-slate-500 mt-1">Please select a programme first.</p>
          )}
        </div>

        {/* Step 3: Select Course (Optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Select Course <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!isCourseEnabled}
            className="w-full input-field cursor-pointer text-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingCourses ? 'Loading available courses...' : '-- All Courses --'}
            </option>
            {courses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
          {!selectedSession && (
            <p className="text-[11px] text-slate-500 mt-1">Please select session to filter by course.</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isSubmitEnabled || isLoading}
            className="w-full py-2.5 btn-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span>Finding assignments...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>SUBMIT</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
