'use client';
import React from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
export default function ThemeProviders({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        {children}
      </ThemeProvider>
    </>
  );
}
