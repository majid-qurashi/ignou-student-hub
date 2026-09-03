'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Check, ShoppingCart, Eye, PenTool, Download } from 'lucide-react';
import { Assignment } from '../../types';
import { useCart } from '../../context/CartContext';

export const AssignmentCard: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
  const { addToCart } = useCart();
  const [selectedOption, setSelectedOption] = useState<'Digital PDF' | 'Solved Assignment' | 'Handwritten Assignment'>('Solved Assignment');
  const [addedToast, setAddedToast] = useState(false);

  const getPrice = () => {
    if (selectedOption === 'Digital PDF') return assignment.pdfPrice;
    if (selectedOption === 'Solved Assignment') return assignment.solvedPrice;
    return assignment.handwrittenPrice;
  };

  const handleAddToCart = () => {
    addToCart({
      id: `${assignment.id}-${selectedOption.replace(/\s+/g, '-').toLowerCase()}`,
      itemType: 'Assignment',
      courseCode: assignment.courseCode,
      courseName: assignment.courseName,
      programmeCode: assignment.programmeCode,
      formatOption: selectedOption,
      price: getPrice()
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover flex flex-col justify-between relative">
      <div className="space-y-4">
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2">
          <span className="bg-blue-100 text-[#0B3D91] text-xs font-bold px-2.5 py-1 rounded-lg">
            {assignment.courseCode}
          </span>
          <span className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
            Session {assignment.session}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {assignment.courseName}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Programme: <span className="font-semibold text-slate-700">{assignment.programmeCode}</span> • {assignment.semesterOrYear}
          </p>
        </div>

        {/* Format Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Select Format Option:
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl">
            <button
              onClick={() => setSelectedOption('Digital PDF')}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition ${
                selectedOption === 'Digital PDF'
                  ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Question PDF
            </button>
            <button
              onClick={() => setSelectedOption('Solved Assignment')}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition ${
                selectedOption === 'Solved Assignment'
                  ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Solved PDF
            </button>
            <button
              onClick={() => setSelectedOption('Handwritten Assignment')}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition ${
                selectedOption === 'Handwritten Assignment'
                  ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Handwritten
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            {assignment.questionsCount} Questions
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Instant Download
          </span>
        </div>
      </div>

      {/* Footer Price & Actions */}
      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Price</span>
          <span className="text-lg font-bold text-slate-900">
            ₹{getPrice()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href={`/assignments/${assignment.courseCode}`}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>

          <button
            onClick={handleAddToCart}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
              addedToast
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0B3D91] hover:bg-[#1557C0] text-white shadow-xs'
            }`}
          >
            {addedToast ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
