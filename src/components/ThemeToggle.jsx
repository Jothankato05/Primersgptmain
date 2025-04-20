import React from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <motion.button
      whileHover={{
        scale: 1.1,
      }}
      whileTap={{
        scale: 0.9,
      }}
      onClick={toggleTheme}
      className={`p-2 cursor-pointer rounded-full ${isDark ? "bg-[#3A3B40] text-yellow-400" : "bg-[#D6EAEA] text-gray-800"} transition-colors duration-200`}
    >
      {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
    </motion.button>
  );
};
export default ThemeToggle;
