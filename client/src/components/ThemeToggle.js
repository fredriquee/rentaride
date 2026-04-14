import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-300 group overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="relative z-10">
        {theme === "light" ? (
          <Moon size={20} className="group-hover:rotate-12 transition-transform duration-300" />
        ) : (
          <Sun size={20} className="group-hover:rotate-45 transition-transform duration-300" />
        )}
      </div>
      <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
}

export default ThemeToggle;
