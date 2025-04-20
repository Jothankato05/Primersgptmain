import React from "react";
import { GlobeIcon } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";
const Header = () => {
  const { isDark } = useTheme();
  return (
    <div className="flex flex-col items-center py-8 px-4">
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div className="text-xl font-semibold flex items-center">
          PrimersGPT
          {/* <span className="ml-2 opacity-60 transform rotate-90">▼</span> */}
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            JP
          </div>
        </div>
      </div>
      <div className="mt-12 flex flex-col items-center animate-fadeIn">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${isDark ? "bg-[#3A3B40]" : "bg-white"}`}
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
