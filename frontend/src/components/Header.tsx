'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Assignments', href: '/assignments' },
    { label: 'Question Papers', href: '/question-papers' },
    { label: 'Projects', href: '/projects' },
    { label: 'Grade Card', href: '/gradecard' }
  ];

  return (
    <header className="bg-white border-b border-slate-300">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src="/ignou-logo.png"
              alt="IGNOU Logo"
              fill
              sizes="40px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight block leading-none">
              IGNOU Student Hub
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Student Utility & Resource Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-600 hover:text-slate-900 transition py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 transition font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/gradecard"
              className="px-3.5 py-1.5 bg-[#714B67] hover:bg-[#5C3D54] text-white rounded-md text-xs font-semibold transition shadow-2xs"
            >
              Check Grade Card
            </Link>
          </div>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-700 rounded border border-slate-300"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-3 space-y-2 text-sm font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-800 border-b border-slate-200 last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-center text-white bg-[#0b3d91] rounded mt-2 font-semibold"
          >
            Login
          </Link>
        </div>
      )}
    </header>
  );
};
