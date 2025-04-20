import React, { useState } from "react";
import { PlusIcon, MicIcon, ArrowUpIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const { isDark } = useTheme();
  const handleSend = () => {
    onSendMessage(message);
    setMessage("");
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <motion.div
      initial={{
        y: 20,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
      }}
      className={`rounded-lg p-2 flex items-center transition-colors duration-200 ${isDark ? "bg-[#2a2a2a]" : "bg-white shadow-md"}`}
    >
      <motion.button
        whileHover={{
          scale: 1.1,
        }}
        whileTap={{
          scale: 0.95,
        }}
        className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-[#3a3a3a] text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
      >
        <PlusIcon size={20} />
      </motion.button>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask anything"
        className={`bg-transparent flex-1 px-3 py-2 outline-none ${isDark ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}`}
      />
      <div className="flex items-center space-x-1">
        <motion.button
          whileHover={{
            scale: 1.1,
          }}
          whileTap={{
            scale: 0.95,
          }}
          className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-[#3a3a3a] text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
        >
          <MicIcon size={20} />
        </motion.button>
        <motion.button
          whileHover={{
            scale: 1.1,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={handleSend}
          className={`p-2 rounded-full transition-colors ${isDark ? "bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
        >
          <ArrowUpIcon size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};
export default ChatInput;
