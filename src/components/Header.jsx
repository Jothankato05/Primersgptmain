import React from "react";
import { GlobeIcon } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import NavBar from "./NavBar";
const Header = () => {
  const { isDark } = useTheme();
  return (
    <div className="flex flex-col items-center pb-8 px-4">
      <div className="mt-12 flex flex-col items-center animate-fadeIn">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${isDark ? "bg-[#3A3B40]" : "bg-[#D6EAEA]"}`}
        >
          <div className="text-blue-500 text-3xl font-bold">P</div>
        </div>
        <h1 className="text-2xl font-bold mb-2">PrimersGPT</h1>
        <div
          className={`flex items-center text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          <span>By primersorganization.com.ng</span>
          <div className="flex items-center ml-2 space-x-1">
            <GlobeIcon size={14} />
            <span>+1</span>
          </div>
        </div>
        <div className={isDark ? "text-gray-300" : "text-gray-700"}>
          One Step Ahead
        </div>
      </div>
    </div>
  );
};
export default Header;
