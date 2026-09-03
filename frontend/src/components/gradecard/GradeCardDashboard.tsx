'use client';

import React from 'react';
import {
  User,
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  BarChart3,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { GradeCardResponse } from '../../services/gradeCardService';

export const GradeCardDashboard: React.FC<{ response: GradeCardResponse }> = ({ response }) => {
  const data = response.data;
  if (!data) return null;

  const { summary, courses } = data;
  const progressPct = Math.round((summary.completedCourses / summary.totalCourses) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Integration Notice Alert Header */}
      {!response.isOfficialIntegrationReady && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Grade Card Dashboard Preview</span>
              <span className="text-[11px] text-slate-600">
                Showing structured UI dashboard layout. Real-time official IGNOU scraping will load data directly here when backend integration is live.
              </span>
            </div>
          </div>
          <a
            href="https://gradecard.ignou.ac.in/gradecard/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-white border border-blue-300 px-3 py-1.5 rounded-lg font-semibold text-[#0B3D91] hover:bg-blue-100 transition"
          >
            Verify Official IGNOU
          </a>
        </div>
      )}

      {/* Student Information Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0B3D91] flex items-center justify-center font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{data.studentName}</h2>
              <p className="text-xs text-slate-500">
                Enrollment No: <span className="font-semibold text-slate-800">{data.enrollmentNo}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
              Status: {summary.status}
            </span>
            <span className="bg-blue-100 text-[#0B3D91] text-xs font-bold px-3 py-1 rounded-full">
              Programme: {data.programmeCode}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[11px]">Full Programme Name</span>
            <span className="font-semibold text-slate-800">{data.programmeName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Last Updated</span>
            <span className="font-semibold text-slate-800">{data.lastUpdated}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Overall Percentage</span>
            <span className="font-bold text-[#0B3D91] text-sm">{summary.overallPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-1">
          <div className="flex items-center space-x-2 text-slate-500 text-xs">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Total Courses</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 block">{summary.totalCourses}</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-1">
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed</span>
          </div>
          <span className="text-2xl font-bold text-emerald-700 block">{summary.completedCourses}</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-1">
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-medium">
            <Clock className="w-4 h-4" />
            <span>Pending</span>
          </div>
          <span className="text-2xl font-bold text-amber-700 block">{summary.pendingCourses}</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-1">
          <div className="flex items-center space-x-2 text-[#0B3D91] text-xs font-medium">
            <Award className="w-4 h-4" />
            <span>Credits Earned</span>
          </div>
          <span className="text-2xl font-bold text-[#0B3D91] block">
            {summary.creditsEarned} / {summary.totalCreditsRequired}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-800">
          <span>Degree Completion Progress</span>
          <span>{progressPct}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#0B3D91] to-[#2563EB] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Course-Wise Academic Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#2563EB]" />
            <h3 className="text-base font-bold text-slate-900">Course-Wise Academic Performance</h3>
          </div>
          <span className="text-xs text-slate-500">6 Courses Listed</span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Course Name</th>
                <th className="py-3 px-4 text-center">Assignment (30%)</th>
                <th className="py-3 px-4 text-center">Theory (70%)</th>
                <th className="py-3 px-4 text-center">Practical</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {courses.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-[#0B3D91]">{c.courseCode}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{c.courseName}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {c.assignmentMarks !== null ? c.assignmentMarks : '-'}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {c.theoryMarks !== null ? c.theoryMarks : '-'}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {c.practicalMarks !== null ? c.practicalMarks : '-'}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">{c.grade}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      c.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-4">
          {courses.map((c, idx) => (
            <div key={idx} className="pt-3 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0B3D91] text-xs">{c.courseCode}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  c.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {c.status}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-900">{c.courseName}</h4>
              <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600">
                <div>Assign: <span className="font-bold text-slate-800">{c.assignmentMarks ?? '-'}</span></div>
                <div>Theory: <span className="font-bold text-slate-800">{c.theoryMarks ?? '-'}</span></div>
                <div>Grade: <span className="font-bold text-slate-800">{c.grade}</span></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
