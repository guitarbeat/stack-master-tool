declare module './ThemeProvider' {
  interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
  }

  export function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element;
  export function useTheme(): ThemeContextType;
}