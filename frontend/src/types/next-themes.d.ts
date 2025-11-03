// Minimal shim for `next-themes` to satisfy TypeScript when the package isn't installed
declare module 'next-themes' {
  export type Theme = 'system' | 'light' | 'dark' | string;

  export function useTheme(): {
    theme?: Theme | undefined;
    setTheme: (t: Theme) => void;
    resolvedTheme?: Theme | undefined;
  };
}
