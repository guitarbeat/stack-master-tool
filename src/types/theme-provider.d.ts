declare module '@/components/ui/ThemeProvider.jsx' {
  import { ReactNode } from 'react';

  interface ThemeProviderProps {
    children: ReactNode;
  }

  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
  
  export function useTheme(): {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
  };
}
