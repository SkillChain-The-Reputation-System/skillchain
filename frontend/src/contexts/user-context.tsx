"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface UserData {
  fullname?: string;
  avatar_url?: string;
}

interface UserContextType {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  refreshUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const updateUserData = useCallback((data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  }, []);

  const refreshUserData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <UserContext.Provider value={{ userData, updateUserData, refreshUserData }}>
      {children}
      <div style={{ display: 'none' }}>{refreshTrigger}</div>
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
