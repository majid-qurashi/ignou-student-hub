import React from 'react';
import Link from 'next/link';
import { BookOpen, GraduationCap, MessageCircle, Mail, ShieldAlert, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#1557C0] flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                IGNOU Student Hub
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your comprehensive student support platform for IGNOU courses. Access course-wise assignments, previous year question papers, solved papers, project synopses, and student evaluation tools.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/919876543210?text=Hi%20IGNOU%20Student%20Hub,%20I%20need%20assistance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/assignments" className="hover:text-white transition">Assignments</Link></li>
              <li><Link href="/question-papers" className="hover:text-white transition">Question Papers</Link></li>
              <li><Link href="/projects" className="hover:text-white transition">Projects & Synopsis</Link></li>
              <li><Link href="/tools/percentage-calculator" className="hover:text-white transition">Calculators</Link></li>
              <li><Link href="/gradecard" className="hover:text-white transition">Grade Card</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Student Tools */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Student Tools
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/tools/percentage-calculator" className="hover:text-white transition">Percentage Calculator</Link></li>
              <li><Link href="/gradecard" className="hover:text-white transition">Grade Card Check</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition">Track Order Status</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Learning Resources</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Support & Contact
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center space-x-2 text-slate-400">
                <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>WhatsApp: +91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@ignoustudenthub.com</span>
              </li>
              <li className="text-[11px] text-slate-500 pt-1">
                Mon - Sat: 9:00 AM - 9:00 PM IST
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">
              © 2026 IGNOU Student Hub. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-500 max-w-2xl">
              <span className="font-semibold text-slate-400">Disclaimer:</span> This is an independent student-support platform and is not affiliated with or endorsed by IGNOU (Indira Gandhi National Open University).
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <Link href="/contact" className="hover:text-white transition">Privacy Policy</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
