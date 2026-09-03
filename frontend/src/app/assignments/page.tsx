'use client';

import React, { useState } from 'react';
import { AssignmentFinder } from '../../components/AssignmentFinder';
import { AssignmentResults } from '../../components/AssignmentResults';
import { fetchApiAssignments, ApiAssignment } from '../../services/api';

export default function AssignmentsPage() {
  const [selectedProgramme, setSelectedProgramme] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ApiAssignment[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const handleFinderSubmit = async (programme: string, session: string, course?: string) => {
    setIsLoading(true);
    setSelectedProgramme(programme);
    setSelectedSession(session);
    setErrorMessage(undefined);

    const res = await fetchApiAssignments(programme, session, course);
    if (res.success) {
      setResults(res.data);
    } else {
      setResults([]);
      setErrorMessage(res.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="py-8 px-4 max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">IGNOU Solved Assignments</h1>
        <p className="text-xs text-slate-600">Select your programme, session, and course to access official assignment documents.</p>
      </div>

      <AssignmentFinder onSubmit={handleFinderSubmit} isLoading={isLoading} />

      {results !== null && (
        <AssignmentResults
          programme={selectedProgramme}
          session={selectedSession}
          assignments={results}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
}
