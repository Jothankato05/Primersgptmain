import React from "react";
import Header from "./components/Header";
import ChatInterface from "./components/ChatInterface";
import { ThemeProvider } from "./context/ThemeContext";
import { useTheme } from "./context/ThemeContext";

const AppContent = () => {
  const { isDark } = useTheme();
  return (
    <div
      className={`flex flex-col w-full min-h-screen transition-colors duration-200 ${isDark ? "bg-[#07081F] text-white" : "bg-gray-100 text-gray-900"}`}
    >
      <Header />
      <ChatInterface />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
