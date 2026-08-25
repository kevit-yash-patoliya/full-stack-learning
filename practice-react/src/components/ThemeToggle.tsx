import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>

      <button onClick={() => setTheme("light")}>
        Light
      </button>

      <button onClick={() => setTheme("dark")}>
        Dark  
      </button>

      <button onClick={() => setTheme("system")}>
        System
      </button>
    </div>
  );
}