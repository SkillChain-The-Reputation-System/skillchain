"use client";

import { useState, useEffect } from "react";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";

export default function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  /** We need this hook because we did got an error of Hydration: 
      -Root cause: The issue occurs because the theme value is determined using client-side information (like system         preferences) but the server doesn't have access to this information during Server-Side Rendering (SSR).
      
      -Solution: Ensure consistent rendering between server and client by
        + Adding a client-side mounting check -> only return this component after the client-side mount -> Should read more about the useEffect hook of React
        + Preventing flashing during hydration
      */ 
  useEffect(() => {
    setMounted(true); // This function runs only once after the initial render on the client
  }, []);

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!mounted) {
    return null; // or a loading placeholder
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
