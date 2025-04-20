import React, { useState, useEffect, useCallback, useRef } from "react";
import { PlusIcon, MicIcon, ArrowUpIcon, ClockIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
const ChatInput = ({ onSendMessage, isWaitingForResponse = false }) => {
  const [message, setMessage] = useState("");
  const { isDark } = useTheme();
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const handleSend = useCallback(() => {
    if (message.trim() && !isWaitingForResponse) {
      onSendMessage(message);
      setMessage("");
    }
  }, [message, onSendMessage, isWaitingForResponse]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Only process Enter key if we're not waiting for a response
      if (!isWaitingForResponse) {
        handleSend();
      }
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
        isMobile || // Don't auto-focus on mobile
        isWaitingForResponse // Don't focus if waiting for a response
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
  }, [isMobile, isWaitingForResponse]); // Added isWaitingForResponse as dependency

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
            scale: isWaitingForResponse ? 1 : 1.1,
          }}
          whileTap={{
            scale: isWaitingForResponse ? 1 : 0.95,
          }}
          disabled={isWaitingForResponse}
          className={`p-2 rounded-full transition-colors ${
            isDark
              ? isWaitingForResponse
                ? "hover:bg-[#2a2a2a] text-gray-600 cursor-not-allowed"
                : "hover:bg-[#3a3a3a] text-gray-400"
              : isWaitingForResponse
                ? "hover:bg-[#D6EAEA] text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-600"
          } hidden sm:block`}
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
        disabled={isWaitingForResponse}
        placeholder={
          isWaitingForResponse
            ? "Waiting for response..."
            : isMobile
              ? "Message"
              : "Ask anything"
        }
        className={`bg-transparent flex-1 px-3 py-2 outline-none text-sm sm:text-base ${
          isDark
            ? `${isWaitingForResponse ? "text-gray-500 cursor-not-allowed" : "text-white"} ${isWaitingForResponse ? "placeholder-gray-500" : "placeholder-gray-400"}`
            : `${isWaitingForResponse ? "text-gray-400 cursor-not-allowed" : "text-gray-900"} ${isWaitingForResponse ? "placeholder-gray-400" : "placeholder-gray-500"}`
        }`}
      />
      <div className="flex items-center space-x-1">
        {!isMobile && (
          <motion.button
            whileHover={{
              scale: isWaitingForResponse ? 1 : 1.1,
            }}
            whileTap={{
              scale: isWaitingForResponse ? 1 : 0.95,
            }}
            disabled={isWaitingForResponse}
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? isWaitingForResponse
                  ? "hover:bg-[#2a2a2a] text-gray-600 cursor-not-allowed"
                  : "hover:bg-[#3a3a3a] text-gray-400"
                : isWaitingForResponse
                  ? "hover:bg-[#D6EAEA] text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-100 text-gray-600"
            } hidden sm:block`}
          >
            <MicIcon size={20} />
          </motion.button>
        )}
        <motion.button
          whileHover={{
            scale: isWaitingForResponse ? 1 : 1.1,
          }}
          whileTap={{
            scale: isWaitingForResponse ? 1 : 0.95,
          }}
          onClick={handleSend}
          disabled={isWaitingForResponse}
          className={`p-2 rounded-full transition-colors ${
            isDark
              ? isWaitingForResponse
                ? "bg-[#3a3a3a] text-gray-500 cursor-not-allowed"
                : "bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-300"
              : isWaitingForResponse
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {isWaitingForResponse ? (
            <ClockIcon size={isMobile ? 16 : 20} className="animate-pulse" />
          ) : (
            <ArrowUpIcon size={isMobile ? 16 : 20} />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
export default ChatInput;
