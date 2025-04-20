import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";

const NavBar = () => {
  const { isDark } = useTheme();

  return (
    <div
      className={`flex items-center justify-between w-full p-4 border-b ${isDark ? "border-slate-600" : "border-slate-500"}`}
    >
      <div className="text-xl font-semibold flex items-center">
        PrimersGPT
        {/* <span className="ml-2 opacity-60 transform rotate-90">▼</span> */}
      </div>
      <div className="flex items-center space-x-3">
        <ThemeToggle />
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
          JP
        </div>
      </div>
    </div>
  );
};

export default NavBar;
