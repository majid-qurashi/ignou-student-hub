'use client';

import React, { useState } from 'react';
import { ApiAssignment } from '../services/api';
import { Search, ExternalLink, Download, FileText, AlertCircle } from 'lucide-react';
import { AssignmentDetailModal } from './AssignmentDetailModal';
import { AssignmentItem } from '../lib/data';

interface AssignmentResultsProps {
  programme: string;
  session: string;
  assignments: ApiAssignment[];
  errorMessage?: string;
}

export const AssignmentResults: React.FC<AssignmentResultsProps> = ({
  programme,
  session,
  assignments,
  errorMessage
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedModalAssignment, setSelectedModalAssignment] = useState<AssignmentItem | null>(null);

  if (errorMessage) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-md p-5 max-w-4xl mx-auto text-center space-y-2 text-xs text-amber-900">
        <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
        <h3 className="font-bold text-sm">IGNOU Source Unavailable</h3>
        <p className="text-amber-700 max-w-md mx-auto leading-relaxed">{errorMessage}</p>
      </div>
    );
  }

  const filtered = assignments.filter(
    (a) =>
      a.course_code.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.course_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleOpenOfficialDocument = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white border border-slate-300 rounded-md p-5 max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {programme} — {session} Available Assignments
          </h3>
          <p className="text-xs text-slate-500">
            Showing {filtered.length} of {assignments.length} assignments
          </p>
        </div>

        {/* Live Filter Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search BCS-012 or Mathematics..."
            className="w-full pl-8 pr-3 py-1.5 input-field text-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Simple Listing Rows */}
      {filtered.length > 0 ? (
        <div className="divide-y divide-slate-200 border border-slate-200 rounded">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-[#0b3d91] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mr-2">
                  {item.course_code}
                </span>
                <span className="font-semibold text-slate-900">{item.course_name}</span>
                {item.title && item.title !== item.course_name && (
                  <p className="text-[11px] text-slate-500">{item.title}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleOpenOfficialDocument(item.source_url)}
                  className="px-3.5 py-1.5 btn-primary text-xs flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Official PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded border border-slate-200 text-xs text-slate-500">
          No assignment found for the selected programme and session.
        </div>
      )}

      <AssignmentDetailModal
        assignment={selectedModalAssignment}
        onClose={() => setSelectedModalAssignment(null)}
      />
    </div>
  );
};
