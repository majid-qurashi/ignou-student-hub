import React from 'react';
import Link from 'next/link';
import { Calculator, Award, ArrowRight } from 'lucide-react';

export default function StudentToolsPage() {
  const tools = [
    {
      name: 'IGNOU Percentage Calculator',
      description: 'Calculate your IGNOU percentage using obtained marks and total marks.',
      href: '/tools/percentage-calculator',
      icon: Calculator
    },
    {
      name: 'IGNOU Grade Card Check',
      description: 'Check official grade card information and academic marks summary.',
      href: '/gradecard',
      icon: Award
    }
  ];

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Student Tools & Utilities</h1>
        <p className="text-xs text-slate-600">Useful calculation and evaluation utilities for IGNOU students.</p>
      </div>

      <div className="space-y-4 max-w-xl mx-auto">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div key={idx} className="bg-white border border-slate-300 rounded p-4 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded bg-blue-50 text-[#0b3d91] flex items-center justify-center shrink-0 border border-blue-200">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{tool.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{tool.description}</p>
                </div>
              </div>

              <Link
                href={tool.href}
                className="px-4 py-2 btn-primary text-xs flex items-center space-x-1 shrink-0"
              >
                <span>Open</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
