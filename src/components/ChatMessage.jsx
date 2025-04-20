import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
const ChatMessage = ({ text, sender }) => {
  const isUser = sender === "user";
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-xl p-3 ${isUser ? "bg-blue-600 text-white rounded-br-none" : `${isDark ? "bg-[#2a2a2a] text-white" : "bg-white text-gray-900 shadow-md"} rounded-bl-none`}`}
      >
        {text}
      </div>
    </motion.div>
  );
};
export default ChatMessage;
