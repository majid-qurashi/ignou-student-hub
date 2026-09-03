'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, Globe } from 'lucide-react';

export default function DeveloperPage() {
  return (
    <div className="py-12 px-4 max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Simple Developer Card */}
      <div className="bg-white border border-slate-300 rounded-lg p-6 text-center space-y-4 shadow-xs">
        
        {/* Avatar */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#0b3d91]/20 bg-slate-100 mx-auto">
          <Image
            src="/ignou-logo.png"
            alt="Majid Qurashi"
            fill
            sizes="96px"
            className="object-contain p-3"
            priority
          />
        </div>

        {/* Basic Information */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">
            Majid Qurashi
          </h1>
          <p className="text-xs font-medium text-[#0b3d91]">
            Software Engineer & Full-Stack Developer
          </p>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          Passionate about building fast, reliable, and accessible web applications for students and communities.
        </p>

        {/* Official Website Link */}
        <div className="pt-2">
          <a
            href="https://qurashi.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#0b3d91] text-white text-xs font-bold rounded hover:bg-blue-900 transition"
          >
            <Globe className="w-4 h-4" />
            <span>Visit qurashi.tech</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

    </div>
  );
}
