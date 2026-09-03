import React from 'react';
import Link from 'next/link';
import {
  FileText,
  HelpCircle,
  CheckCircle,
  FileCheck2,
  FolderKanban,
  Award,
  ArrowRight
} from 'lucide-react';

export const ServiceGrid: React.FC = () => {
  const services = [
    {
      title: '1. IGNOU Assignments',
      description: 'Get course-wise IGNOU assignments and study resources.',
      features: [
        'Course-wise & Subject-wise',
        'Solved assignments',
        'Handwritten assignment option',
        'Digital PDF option'
      ],
      buttonText: 'Explore Assignments',
      href: '/assignments',
      icon: FileText,
      badge: 'Most Popular'
    },
    {
      title: '2. Previous Year Question Papers',
      description: 'Find IGNOU previous year question papers organized by programme and course.',
      features: [
        'Term End Exams (June & Dec)',
        'Programme-wise categories',
        'Instant download'
      ],
      buttonText: 'Browse Papers',
      href: '/question-papers',
      icon: HelpCircle
    },
    {
      title: '3. Solved Question Papers',
      description: 'Practice with solved question papers and detailed answers.',
      features: [
        'Detailed step-by-step solutions',
        'Expert-verified answers',
        'Exam preparation focus'
      ],
      buttonText: 'Explore Solved Papers',
      href: '/question-papers?type=solved',
      icon: CheckCircle
    },
    {
      title: '4. Model Papers',
      description: 'Practice exam-oriented model papers designed for preparation.',
      features: [
        'Curated exam-like questions',
        'Expected exam patterns',
        'Quick revision guide'
      ],
      buttonText: 'View Model Papers',
      href: '/question-papers?type=model',
      icon: FileCheck2
    },
    {
      title: '5. Project Synopsis',
      description: 'Course-specific project synopsis resources.',
      features: [
        'Approved format templates',
        'Objectives & Methodology',
        'Guide guidelines'
      ],
      buttonText: 'Explore Synopsis',
      href: '/projects?tab=synopsis',
      icon: FolderKanban
    },
    {
      title: '6. Project Reports',
      description: 'Project report resources organized by programme and subject.',
      features: [
        'Full project documentation',
        'Diagrams & Data analysis',
        'Viva question support'
      ],
      buttonText: 'Explore Projects',
      href: '/projects?tab=reports',
      icon: Award
    }
  ];

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider bg-blue-100/80 px-3 py-1 rounded-full">
            Comprehensive Services
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Services
          </h2>
          <p className="text-sm text-slate-600">
            Select a service category to access updated assignments, question papers, projects, and academic support tools.
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 card-hover flex flex-col justify-between relative overflow-hidden"
              >
                {service.badge && (
                  <span className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {service.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B3D91] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {service.features && (
                    <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                      {service.features.map((feat, fIdx) => (
                        <li key={fIdx} className="text-xs text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-6">
                  <Link
                    href={service.href}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-[#0B3D91] text-slate-800 hover:text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group"
                  >
                    <span>{service.buttonText}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
