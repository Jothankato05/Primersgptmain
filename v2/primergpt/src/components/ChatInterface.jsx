import React, { useEffect, useState, useRef } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { motion } from "framer-motion";
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (message) => {
    if (!message.trim()) return;
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: message,
        sender: "user",
      },
    ]);
    // Simulate bot typing
    setIsTyping(true);
    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "I'm PrimersGPT, how can I assist you today?",
          sender: "bot",
        },
      ]);
    }, 1500);
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
      }}
      className="flex-1 flex flex-col items-center justify-between px-4 pb-4 h-full"
    >
      <div className="w-full max-w-3xl flex-1 overflow-y-auto mb-4 flex flex-col justify-end">
        {messages.length > 0 ? (
          <div className="space-y-4 mt-auto bg-opacity-0">
            <div className="hidden">{messages.length}</div>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                text={message.text}
                sender={message.sender}
              />
            ))}
            {isTyping && (
              <div className="text-gray-400 text-sm">
                PrimersGPT is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : null}
      </div>
      <div className="w-full border-t border-gray-500 p-4 max-w-3xl sticky bottom-0 backdrop-blur-md">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </motion.div>
  );
};
export default ChatInterface;
