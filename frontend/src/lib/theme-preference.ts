import * as React from "react";

export type ThemeName = "light" | "dark" | "system";

const STORAGE_KEY = "cross-examine-theme";
const THEME_EVENT = "cross-examine-theme-change";

export function getStoredTheme(): ThemeName {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

export function resolvedTheme(theme: ThemeName): "light" | "dark" {
  if (theme !== "system") return theme;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;
  const resolved = resolvedTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = resolved;
}

export function setStoredTheme(theme: ThemeName) {
  window.localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent<ThemeName>(THEME_EVENT, { detail: theme }));
}

export function initializeTheme() {
  applyTheme(getStoredTheme());
}

export function useThemePreference() {
  const [theme, setThemeState] = React.useState<ThemeName>(getStoredTheme);

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (getStoredTheme() === "system") applyTheme("system");
      setThemeState(getStoredTheme());
    };
    const onThemeChange = (event: Event) => setThemeState((event as CustomEvent<ThemeName>).detail);
    media.addEventListener("change", onSystemChange);
    window.addEventListener(THEME_EVENT, onThemeChange);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener(THEME_EVENT, onThemeChange);
    };
  }, []);

  return {
    resolved: resolvedTheme(theme),
    setTheme: setStoredTheme,
    theme,
  };
}
