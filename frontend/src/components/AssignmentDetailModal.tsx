'use client';

import React from 'react';
import { X, Download, FileText, PenTool } from 'lucide-react';
import { AssignmentItem } from '../lib/data';

interface AssignmentDetailModalProps {
  assignment: AssignmentItem | null;
  onClose: () => void;
}

export const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({ assignment, onClose }) => {
  if (!assignment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-md w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-lg animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold bg-blue-100 text-[#0b3d91] px-2 py-0.5 rounded">
              {assignment.courseCode}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{assignment.courseName}</h2>
            <p className="text-xs text-slate-500">
              Programme: <span className="font-semibold text-slate-700">{assignment.programme}</span> • Session: <span className="font-semibold text-slate-700">{assignment.year}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 border border-slate-200 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Questions Document View */}
        <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
            Assignment Questions Preview:
          </h3>
          <ol className="space-y-2 text-slate-800 font-mono text-[12px] leading-relaxed">
            {assignment.questions.map((q, idx) => (
              <li key={idx} className="bg-white p-2.5 rounded border border-slate-200">
                {q}
              </li>
            ))}
          </ol>
        </div>

        {/* Actions at bottom */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2 text-xs font-semibold">
          <button
            onClick={() => alert(`Downloading Question PDF for ${assignment.courseCode}...`)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => alert(`Requesting Solved Assignment PDF for ${assignment.courseCode}...`)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded flex items-center space-x-1"
          >
            <FileText className="w-4 h-4" />
            <span>Get Solved Assignment</span>
          </button>

          <button
            onClick={() => alert(`Ordering Handwritten Hardcopy for ${assignment.courseCode}...`)}
            className="px-3.5 py-2 bg-[#0b3d91] hover:bg-[#1557c0] text-white rounded flex items-center space-x-1"
          >
            <PenTool className="w-4 h-4" />
            <span>Order Handwritten</span>
          </button>
        </div>

      </div>
    </div>
  );
};
