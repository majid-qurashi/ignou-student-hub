'use client';

import React, { useState } from 'react';
import { HelpCircle, Download, CheckCircle, FileText, ShoppingCart } from 'lucide-react';
import { QuestionPaper } from '../../types';
import { useCart } from '../../context/CartContext';

export const QuestionPaperCard: React.FC<{ paper: QuestionPaper }> = ({ paper }) => {
  const { addToCart } = useCart();
  const [downloading, setDownloading] = useState(false);

  const price = paper.paperType === 'Solved Paper' ? 49 : 0; // PYQ free preview, Solved ₹49

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Downloading ${paper.courseCode} ${paper.term} ${paper.year} (${paper.paperType}) PDF...`);
    }, 1000);
  };

  const handleAddToCart = () => {
    addToCart({
      id: paper.id,
      itemType: 'QuestionPaper',
      courseCode: paper.courseCode,
      courseName: paper.courseName,
      programmeCode: paper.programmeCode,
      formatOption: 'Digital PDF',
      price: price > 0 ? price : 29
    });
    alert(`Added ${paper.courseCode} Solved Paper to Cart!`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="bg-blue-50 text-[#0B3D91] text-xs font-bold px-2.5 py-1 rounded-lg">
            {paper.courseCode}
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
            paper.paperType === 'Solved Paper'
              ? 'bg-emerald-100 text-emerald-800'
              : paper.paperType === 'Model Paper'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {paper.paperType}
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {paper.courseName}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Exam: <span className="font-semibold text-slate-800">{paper.term} {paper.year}</span> • Programme: {paper.programmeCode}
          </p>
        </div>

        {paper.solutionsAvailable && (
          <div className="flex items-center space-x-1.5 text-[11px] text-emerald-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Verified Step-by-Step Solutions Included</span>
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Access</span>
          <span className="text-sm font-bold text-slate-900">
            {price === 0 ? 'Free PDF' : `₹${price}`}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Downloading...' : 'PDF'}</span>
          </button>

          {price > 0 && (
            <button
              onClick={handleAddToCart}
              className="px-3 py-2 bg-[#0B3D91] hover:bg-[#1557C0] text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Get Solved</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
