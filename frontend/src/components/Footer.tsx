import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 border-t border-slate-300 py-6 text-xs text-slate-600 mt-auto">
      <div className="max-w-6xl mx-auto px-4 space-y-3 text-center">
        
        {/* Simple Links Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 font-semibold text-slate-700">
          <Link href="/assignments" className="hover:text-[#0b3d91] hover:underline">Assignments</Link>
          <span>|</span>
          <Link href="/question-papers" className="hover:text-[#0b3d91] hover:underline">Question Papers</Link>
          <span>|</span>
          <Link href="/model-papers" className="hover:text-[#0b3d91] hover:underline">Model Papers</Link>
          <span>|</span>
          <Link href="/projects" className="hover:text-[#0b3d91] hover:underline">Projects</Link>
          <span>|</span>
          <Link href="/tools" className="hover:text-[#0b3d91] hover:underline">Tools</Link>
          <span>|</span>
          <Link href="/gradecard" className="hover:text-[#0b3d91] hover:underline">Grade Card</Link>
          <span>|</span>
          <Link href="/developer" className="hover:text-[#0b3d91] hover:underline">About Developer</Link>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-slate-500 max-w-xl mx-auto">
          Independent student-support platform. Not affiliated with or endorsed by IGNOU (Indira Gandhi National Open University).
        </p>

        {/* Developer Attribution with Name only in <a> Tag */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-[11px] font-medium text-slate-600">
          <span>© 2026 IGNOU Student Hub. All rights reserved.</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center space-x-1">
            <span>Developed by</span>
            <a
              href="https://qurashi.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0b3d91] font-bold hover:underline"
            >
              Majid Qurashi
            </a>
          </span>
        </div>

      </div>
    </footer>
  );
};
