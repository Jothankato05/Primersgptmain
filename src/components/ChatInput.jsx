import React, { useState, useEffect, useCallback, useRef } from "react";
import { PlusIcon, MicIcon, ArrowUpIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const { isDark } = useTheme();
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  }, [message, onSendMessage]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check if viewport is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640); // 640px is typical sm breakpoint
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Simplified effect to just focus the input when a key is pressed
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore if user is already typing in an input or using modifier keys
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        isMobile // Don't auto-focus on mobile
      ) {
        return;
      }

      // Only focus for printable characters
      if (e.key.length === 1) {
        inputRef.current.focus();
      }
    };

    // Add the global event listener
    window.addEventListener("keydown", handleGlobalKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isMobile]); // Added isMobile as dependency

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
      className={`rounded-lg p-2 flex items-center transition-colors duration-200 w-full max-w-full ${isDark ? "bg-[#2a2a2a]" : "bg-[#D6EAEA] shadow-md"}`}
    >
      {!isMobile && (
        <motion.button
          whileHover={{
            scale: 1.1,
          }}
          whileTap={{
            scale: 0.95,
          }}
          className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-[#3a3a3a] text-gray-400" : "hover:bg-gray-100 text-gray-600"} hidden sm:block`}
        >
          <PlusIcon size={20} />
        </motion.button>
      )}
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={isMobile ? "Message" : "Ask anything"}
        className={`bg-transparent flex-1 px-3 py-2 outline-none text-sm sm:text-base ${isDark ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}`}
      />
      <div className="flex items-center space-x-1">
        {!isMobile && (
          <motion.button
            whileHover={{
              scale: 1.1,
            }}
            whileTap={{
              scale: 0.95,
            }}
            className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-[#3a3a3a] text-gray-400" : "hover:bg-gray-100 text-gray-600"} hidden sm:block`}
          >
            <MicIcon size={20} />
          </motion.button>
        )}
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
          <ArrowUpIcon size={isMobile ? 16 : 20} />
        </motion.button>
      </div>
    </motion.div>
  );
};
export default ChatInput;
