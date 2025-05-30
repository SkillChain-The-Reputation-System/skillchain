"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface RecruiterData {
  fullname?: string;
  company?: string;
  position?: string;
  avatar_url?: string;
  email?: string;
  bio?: string;
}

interface RecruiterContextType {
  recruiterData: RecruiterData;
  updateRecruiterData: (data: Partial<RecruiterData>) => void;
  refreshRecruiterData: () => void;
}

const RecruiterContext = createContext<RecruiterContextType | undefined>(undefined);

export function RecruiterProvider({ children }: { children: React.ReactNode }) {
  const [recruiterData, setRecruiterData] = useState<RecruiterData>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const updateRecruiterData = useCallback((data: Partial<RecruiterData>) => {
    setRecruiterData(prev => ({ ...prev, ...data }));
  }, []);

  const refreshRecruiterData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <RecruiterContext.Provider value={{ recruiterData, updateRecruiterData, refreshRecruiterData }}>
      {children}
      <div style={{ display: 'none' }}>{refreshTrigger}</div>
    </RecruiterContext.Provider>
  );
}

export function useRecruiter() {
  const context = useContext(RecruiterContext);
  if (context === undefined) {
    throw new Error('useRecruiter must be used within a RecruiterProvider');
  }
  return context;
}
