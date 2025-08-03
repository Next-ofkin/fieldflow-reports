// components/ThemeToggle.tsx
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () =>
    setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
};
