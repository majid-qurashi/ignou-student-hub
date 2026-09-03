'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ASSIGNMENTS } from '../../../data/mockData';
import { FileText, CheckCircle2, ShoppingCart, ArrowLeft, PenTool, Download, ShieldCheck } from 'lucide-react';
import { useCart } from '../../../context/CartContext';

export default function AssignmentDetailPage() {
  const params = useParams();
  const rawCode = Array.isArray(params.courseCode) ? params.courseCode[0] : params.courseCode;
  const courseCode = decodeURIComponent(rawCode || '').toUpperCase();

  const { addToCart } = useCart();
  const [selectedFormat, setSelectedFormat] = useState<'Digital PDF' | 'Solved Assignment' | 'Handwritten Assignment'>('Solved Assignment');

  const assignment = ASSIGNMENTS.find(
    (a) => a.courseCode.toUpperCase() === courseCode
  ) || ASSIGNMENTS[0]; // fallback demo item if code not found

  const getPrice = () => {
    if (selectedFormat === 'Digital PDF') return assignment.pdfPrice;
    if (selectedFormat === 'Solved Assignment') return assignment.solvedPrice;
    return assignment.handwrittenPrice;
  };

  const handleOrder = () => {
    addToCart({
      id: `${assignment.id}-${selectedFormat.replace(/\s+/g, '-').toLowerCase()}`,
      itemType: 'Assignment',
      courseCode: assignment.courseCode,
      courseName: assignment.courseName,
      programmeCode: assignment.programmeCode,
      formatOption: selectedFormat,
      price: getPrice()
    });
    alert(`Added ${assignment.courseCode} (${selectedFormat}) to Cart!`);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb & Back button */}
      <div>
        <Link
          href="/assignments"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B3D91] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignments</span>
        </Link>
      </div>

      {/* Main Detail Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-[#0B3D91] text-xs font-bold px-3 py-1 rounded-lg">
              {assignment.courseCode}
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md">
              Session {assignment.session}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Programme: <span className="font-bold text-slate-800">{assignment.programmeCode}</span> ({assignment.semesterOrYear})
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {assignment.courseName}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Official IGNOU solved assignment questions, step-by-step solutions, and handwritten assignment hard copies prepared according to university evaluation standards.
        </p>
      </div>

      {/* Format Selector & Order Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Options */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Select Product Format Option
          </h2>

          <div className="space-y-3">
            {/* Question PDF */}
            <div
              onClick={() => setSelectedFormat('Digital PDF')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
                selectedFormat === 'Digital PDF'
                  ? 'border-[#2563EB] bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Download className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-900">Question Paper PDF</h3>
                  <span className="text-sm font-bold text-slate-900">₹{assignment.pdfPrice}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Official session assignment question paper PDF for self-preparation.
                </p>
              </div>
            </div>

            {/* Solved Assignment PDF */}
            <div
              onClick={() => setSelectedFormat('Solved Assignment')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
                selectedFormat === 'Solved Assignment'
                  ? 'border-[#2563EB] bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <FileText className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-900">100% Solved PDF</h3>
                  <span className="text-sm font-bold text-slate-900">₹{assignment.solvedPrice}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Complete step-by-step solved assignment ready to download and reference.
                </p>
              </div>
            </div>

            {/* Handwritten Copy */}
            <div
              onClick={() => setSelectedFormat('Handwritten Assignment')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3 ${
                selectedFormat === 'Handwritten Assignment'
                  ? 'border-[#2563EB] bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <PenTool className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-900">Handwritten Hard Copy (Home Delivery)</h3>
                  <span className="text-sm font-bold text-slate-900">₹{assignment.handwrittenPrice}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Neatly handwritten on A4 sheet with proper cover page, ready for study center submission.
                </p>
              </div>
            </div>
          </div>

          {/* Overview & Questions Preview */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Assignment Overview & Questions
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Covers all {assignment.questionsCount} compulsory questions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified by IGNOU subject academic experts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant PDF download link upon confirmation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right CTA Box */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Selected Format</span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedFormat}</h3>
            <span className="text-2xl font-extrabold text-[#0B3D91] mt-2 block">
              ₹{getPrice()}
            </span>
          </div>

          <button
            onClick={handleOrder}
            className="w-full py-3.5 bg-[#0B3D91] hover:bg-[#1557C0] text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Order Now / Add to Cart</span>
          </button>

          <div className="bg-slate-50 p-4 rounded-xl text-[11px] text-slate-600 space-y-2 border border-slate-200">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Guaranteed Quality</span>
            </div>
            <p className="leading-relaxed">
              Assignments are crafted to comply with IGNOU Study Center submission guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
