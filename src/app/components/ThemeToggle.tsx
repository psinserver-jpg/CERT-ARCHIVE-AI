"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_STORAGE_KEY = "certvault-theme";

export default function ThemeToggle() {
  useEffect(() => {
    let savedTheme: string | null = null;
    try {
      savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // Keep dark mode as the default when storage is unavailable.
    }

    document.documentElement.dataset.theme = savedTheme === "light" ? "light" : "dark";
  }, []);

  const toggleTheme = () => {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The current page still changes theme if storage is unavailable.
    }
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="다크모드와 화이트모드 전환"
      title="다크모드와 화이트모드 전환"
    >
      <Sun className="theme-icon-light" size={18} aria-hidden="true" />
      <Moon className="theme-icon-dark" size={18} aria-hidden="true" />
    </button>
  );
}
