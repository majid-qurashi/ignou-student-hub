import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Users,
  Award,
  Clock,
  MessageCircle,
  FileCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white pt-10 pb-16 md:pt-16 md:pb-24">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full filter blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-blue-100/80 border border-blue-200 px-3.5 py-1.5 rounded-full">
              <GraduationCap className="w-4 h-4 text-[#0B3D91]" />
              <span className="text-xs font-semibold text-[#0B3D91]">
                Trusted by IGNOU Students Nationwide
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              All IGNOU Student Services <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B3D91] to-[#2563EB]">
                in One Place
              </span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Assignments, previous year papers, solved papers, model papers, projects and useful study tools — everything you need for your IGNOU journey.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/assignments"
                className="px-6 py-3.5 bg-[#0B3D91] hover:bg-[#1557C0] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/assignments"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#0B3D91] border border-slate-300 text-sm font-semibold rounded-xl transition-all shadow-xs"
              >
                Order Now
              </Link>
            </div>

            {/* Trust Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[#0B3D91]">
                  <Users className="w-4 h-4" />
                  <span className="text-xl font-bold">50K+</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Students</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[#0B3D91]">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xl font-bold">1000+</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Courses & Subjects</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[#0B3D91]">
                  <Clock className="w-4 h-4" />
                  <span className="text-xl font-bold">24/7</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Support</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[#0B3D91]">
                  <Award className="w-4 h-4" />
                  <span className="text-xl font-bold">100%</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Student-Focused</p>
              </div>
            </div>
          </div>

          {/* Right Side Visual Illustration & Why Choose Us Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Academic Visual Container */}
            <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-slate-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0" />
              
              <div className="relative z-10 space-y-5">
                {/* Academic Graphic Banner */}
                <div className="bg-gradient-to-br from-[#0B3D91] to-[#1557C0] rounded-xl p-5 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                      IGNOU Academic Hub
                    </span>
                    <h3 className="text-lg font-bold">Comprehensive Study Kit</h3>
                    <p className="text-xs text-blue-100 mt-1">Course-Wise & Session Verified</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-xs">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Why Students Choose Us Card */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#2563EB]" />
                    <span>Why Students Choose Us</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 font-medium">
                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Updated study resources</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Easy ordering</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Handwritten option</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Course-wise resources</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Student-friendly pricing</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Fast 24/7 support</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Support CTA */}
                <a
                  href="https://wa.me/919876543210?text=Hi%20IGNOU%20Student%20Hub,%20I%20have%20a%20query"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Need Instant Help? Chat on WhatsApp</span>
                </a>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
