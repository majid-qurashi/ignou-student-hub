'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  Search,
  ShoppingCart,
  Menu,
  X,
  Truck,
  User,
  Calculator,
  Award,
  FileText,
  HelpCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Assignments', href: '/assignments' },
    { label: 'Question Papers', href: '/question-papers' },
    { label: 'Projects', href: '/projects' },
    { label: 'Calculators', href: '/tools/percentage-calculator' },
    { label: 'Grade Card', href: '/gradecard' },
    { label: 'Student Dashboard', href: '/dashboard' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Bar / First Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B3D91] to-[#2563EB] flex items-center justify-center text-white shadow-sm">
              <div className="relative flex items-center justify-center">
                <BookOpen className="w-5 h-5 absolute opacity-40 -translate-y-1" />
                <GraduationCap className="w-6 h-6 relative z-10" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-[#0B3D91] tracking-tight block leading-none">
                IGNOU Student Hub
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                Your IGNOU Journey, Simplified
              </span>
            </div>
          </Link>

          {/* Desktop Central Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl mx-4 relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments, papers, projects, course codes..."
              className="w-full pl-10 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-full text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-4 bg-[#0B3D91] text-white text-xs font-semibold rounded-full hover:bg-[#1557C0] transition flex items-center gap-1"
            >
              Search
            </button>
          </form>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/track-order"
              className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 hover:text-[#0B3D91] bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition"
            >
              <Truck className="w-4 h-4 text-[#2563EB]" />
              <span>Track Order</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center space-x-1 text-xs font-medium text-slate-700 hover:text-[#0B3D91] px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>Login / Sign Up</span>
            </Link>

            <Link
              href="/cart"
              className="relative p-2.5 text-slate-700 hover:text-[#0B3D91] bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center justify-center"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-[#0B3D91]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#2563EB] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center space-x-3">
            <Link href="/cart" className="relative p-2 text-slate-700">
              <ShoppingCart className="w-6 h-6 text-[#0B3D91]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2563EB] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Second Row Navigation (Desktop) */}
      <div className="hidden md:block border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-6 py-2.5 overflow-x-auto text-xs font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-700 hover:text-[#0B3D91] transition whitespace-nowrap py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments, papers..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          <div className="flex flex-col space-y-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-[#0B3D91] transition flex items-center justify-between"
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            <Link
              href="/track-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg flex items-center justify-center space-x-2"
            >
              <Truck className="w-4 h-4 text-[#2563EB]" />
              <span>Track Order</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-semibold text-white bg-[#0B3D91] rounded-lg"
            >
              Login / Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
