"use client";

import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { marked } from 'marked'
import { useAuthStore } from '../../store/authStore'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  type: 'user' | 'ai'
  timestamp: Date
  visualization?: 'wave' | 'sphere' | 'none'
  userId?: string
  username?: string
  avatarUrl?: string
}

const userAvatars = {
  ai: '/images/primers-logo.png',
  default: '/images/default-avatar.png'
};

function getAvatar(type: 'user' | 'ai', username?: string) {
  if (type === 'ai') return userAvatars['ai']
  if (username) {
    // Use the Primers logo for AI, generate unique avatar for users
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
  }
  return userAvatars['default']
}

function renderMarkdown(content: string) {
  const html = marked.parse(content);
  return html as string;
}

const Header = () => {
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="flex items-center">
        <div className="relative w-10 h-10 mr-2">
          <Image
            src="/images/primers-logo.png"
            alt="Primers Logo"
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
        <h1 className="text-xl font-bold text-white">PrimerGPT</h1>
      </div>
      {user && (
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-600 transition-colors rounded-lg px-3 py-2"
            >
              <div className="relative w-8 h-8">
                <Image
                  src={getAvatar('user', user.username)}
                  alt={user.username}
                  layout="fill"
                  className="rounded-full"
                />
              </div>
              <span className="text-white font-medium">{user.username}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-10">
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    socketRef.current = io('http://localhost:3000', {
      auth: { token: useAuthStore.getState().token }
    })

    socketRef.current.on('ai-response', (response: { content: string; visualization?: 'wave' | 'sphere' | 'none'; code?: string }) => {
      addMessage({
        id: Date.now().toString(),
        type: 'ai',
        content: response.content,
        timestamp: new Date(),
        visualization: response.visualization || 'none',
        userId: 'ai',
        username: 'AI',
        avatarUrl: getAvatar('ai')
      });
      setLoading(false);
    })

    return () => { socketRef.current?.disconnect(); };
  }, [])

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date(),
      userId: user?.id || 'default',
      username: user?.username || 'You',
      avatarUrl: getAvatar('user', user?.username)
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'message',
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: data.content,
        type: 'ai',
        timestamp: new Date(),
        userId: 'ai',
        username: 'AI',
        avatarUrl: getAvatar('ai')
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message to user
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: 'Sorry, there was an error processing your message.',
          type: 'ai',
          timestamp: new Date(),
          userId: 'ai',
          username: 'AI',
          avatarUrl: getAvatar('ai')
        },
      ]);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ imageBase64: base64 })
      });

      if (!response.ok) throw new Error('Failed to analyze image');

      const data = await response.json();
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: 'Uploaded an image for analysis',
        timestamp: new Date(),
        visualization: 'none'
      };

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.analysis.result,
        timestamp: new Date(),
        visualization: 'none'
      };

      setMessages(prev => [...prev, newMessage, aiResponse]);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(systemDark ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', systemDark)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const saved = localStorage.getItem('chatMessages')
    if (saved) {
      try {
        const parsed: Message[] = JSON.parse(saved)
        setMessages(parsed.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages))
  }, [messages])

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <Header />
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="flex-1 flex flex-col max-w-6xl mx-auto p-4">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              className="px-4 py-2 rounded-xl border dark:bg-gray-700 dark:text-white bg-white text-gray-800 shadow hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              type="button"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            <AnimatePresence>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.type === 'user'
                        ? 'flex-row-reverse space-x-reverse'
                        : 'flex-row'
                    }`}
                  >
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src={message.avatarUrl || getAvatar(message.type)}
                        alt={message.username || message.type}
                        layout="fill"
                        className="rounded-full"
                      />
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.username || (message.type === 'ai' ? 'AI' : 'You')}
                      </div>
                      <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </AnimatePresence>
            <div ref={endOfMessagesRef} />
          </div>
          <div className="border-t dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2 max-w-4xl mx-auto">
              <label className="cursor-pointer" aria-label="Upload image">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  title="Upload an image for analysis"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500 hover:text-blue-500 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2.5 rounded-xl border dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                aria-label="Message input"
              />
              <button
                onClick={() => handleSendMessage(input)}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2.5 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
                aria-label="Send message"
              >
                {loading ? 'Processing...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
