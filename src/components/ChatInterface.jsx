import React, { useEffect, useState, useRef } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const generateSessionId = () => {
    return Math.floor(Math.random() * 1000000000000).toString();
  };

  const [sessionId] = useState(generateSessionId());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Check if we have 2 user messages and 2 bot messages
    const userMessages = messages.filter((msg) => msg.sender === "user");
    const botMessages = messages.filter((msg) => msg.sender === "bot");

    if (userMessages.length >= 2 && botMessages.length >= 2) {
      setShowHeader(false);
    }
  }, [messages]);

  // Function to render markdown
  const renderMarkdown = (text) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            />
          ),
          p: ({ node, ...props }) => <p {...props} className="mb-4" />,
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-2xl font-bold mb-4 mt-6" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-xl font-bold mb-3 mt-5" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-lg font-bold mb-2 mt-4" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc ml-5 mb-4" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal ml-5 mb-4" />
          ),
          li: ({ node, ...props }) => <li {...props} className="mb-1" />,
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code
                {...props}
                className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded"
              />
            ) : (
              <code
                {...props}
                className="block bg-gray-100 dark:bg-gray-800 p-3 rounded my-2 overflow-x-auto"
              />
            ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-gray-300 pl-4 py-1 italic"
            />
          ),
          table: ({ node, ...props }) => (
            <table
              {...props}
              className="border-collapse table-auto w-full my-4"
            />
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="border border-gray-300 px-4 py-2 bg-gray-100 dark:bg-gray-800"
            />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="border border-gray-300 px-4 py-2" />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || isWaitingForResponse) return;

    // Set waiting for response state to prevent multiple messages
    setIsWaitingForResponse(true);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: message,
        sender: "user",
      },
    ]);
    // Show bot typing indicator
    setIsTyping(true);

    try {
      // Send request to localhost with auth
      const response = await fetch(
        // "https://n8n-service-sfwl.onrender.com/webhook-test/b4b2bf0b-efe1-45ec-b19d-a50a67ea2fa9",
        "https://n8n-service-sfwl.onrender.com/webhook/b4b2bf0b-efe1-45ec-b19d-a50a67ea2fa9",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-ID": sessionId,
            Authorization: "Basic " + btoa("ace:n8nworkflow"), // Basic auth encoding
          },
          body: JSON.stringify({
            message: message,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Add bot response
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: data.output || "I'm PrimersGPT, how can I assist you today?",
          sender: "bot",
          isMarkdown: true, // Flag to indicate markdown content
        },
      ]);

      // Allow user to send another message
      setIsWaitingForResponse(false);
    } catch (error) {
      console.error("Error:", error);
      // Handle error - still need to show something to the user
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Sorry, I couldn't connect to the server. Please try again later.",
          sender: "bot",
        },
      ]);

      // Allow user to send another message
      setIsWaitingForResponse(false);
    }
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
      className="flex-1 flex flex-col items-center justify-between px-2 sm:px-4 h-full"
    >
      <div className="flex flex-col h-full w-full relative">
        <AnimatePresence mode="wait">
          {showHeader && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: "easeOut",
                },
              }}
              exit={{
                opacity: 0,
                y: -30,
                scale: 0.95,
                filter: "blur(8px)",
                transition: {
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1],
                },
              }}
              className="w-full flex-shrink-0"
            >
              <Header />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="w-full max-w-3xl mx-auto flex-1 overflow-y-auto scrollbar-hide pt-5 flex flex-col"
          style={{
            height: "calc(100vh - 130px)",
            scrollbarWidth: "none",
            paddingBottom: "100px", // Increased padding for mobile
          }}
          animate={{
            y: 0,
          }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {messages.length > 0 ? (
            <div className="space-y-4 bg-opacity-0 px-2 sm:px-0">
              <div className="hidden">{messages.length}</div>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.isMarkdown && message.sender === "bot" ? (
                    <div
                      className={`p-3 rounded-lg ${message.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 self-start"}`}
                    >
                      {renderMarkdown(message.text)}
                    </div>
                  ) : (
                    <ChatMessage text={message.text} sender={message.sender} />
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <div className="text-gray-400 text-sm pl-2">
                  PrimersGPT is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : null}
        </motion.div>

        <div className="w-full backdrop-blur-xl px-3 sm:px-10 mx-auto fixed bottom-0 left-0 right-0 flex justify-center pb-safe">
          <div className="max-w-5xl w-full pt-1 pb-2 sm:pb-4">
            <ChatInput
              onSendMessage={handleSendMessage}
              isWaitingForResponse={isWaitingForResponse}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default ChatInterface;
