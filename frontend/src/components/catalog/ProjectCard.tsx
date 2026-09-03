'use client';

import React from 'react';
import { FolderKanban, ShoppingCart, Check, FileText } from 'lucide-react';
import { ProjectResource } from '../../types';
import { useCart } from '../../context/CartContext';

export const ProjectCard: React.FC<{ project: ProjectResource }> = ({ project }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (option: 'Project Synopsis' | 'Full Project Report') => {
    const price = option === 'Project Synopsis' ? 299 : project.price;
    addToCart({
      id: `${project.id}-${option.replace(/\s+/g, '-').toLowerCase()}`,
      itemType: 'Project',
      courseCode: project.courseCode,
      courseName: project.courseName,
      programmeCode: project.programmeCode,
      formatOption: option,
      price
    });
    alert(`Added ${option} for ${project.courseCode} to Cart!`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-lg">
            {project.courseCode}
          </span>
          <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
            {project.projectType}
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {project.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Programme: <span className="font-semibold text-slate-700">{project.programmeCode}</span> ({project.courseName})
          </p>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
          {project.description}
        </p>

        <div className="flex items-center space-x-3 text-[11px] text-slate-500">
          {project.synopsisAvailable && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <Check className="w-3.5 h-3.5" /> Synopsis Ready
            </span>
          )}
          {project.reportAvailable && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <Check className="w-3.5 h-3.5" /> Full Report & Code
            </span>
          )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Starting From</span>
          <span className="text-base font-bold text-slate-900">
            ₹{project.price}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {project.synopsisAvailable && (
            <button
              onClick={() => handleAddToCart('Project Synopsis')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
            >
              Get Synopsis
            </button>
          )}

          <button
            onClick={() => handleAddToCart('Full Project Report')}
            className="px-3.5 py-2 bg-[#0B3D91] hover:bg-[#1557C0] text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Get Full Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
