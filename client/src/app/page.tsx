import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const user = null // Assuming user is not logged in, replace with actual user data

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 p-8">
        <div className="flex flex-col items-center space-y-6">
          <Image
            src="/images/primers-logo.png"
            alt="Primers Logo"
            width={120}
            height={120}
            className="rounded-2xl shadow-lg"
          />
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 mb-8">
            PrimersGPT
          </h1>
        </div>
        <div className="space-y-4">
          {!user ? (
            <>
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-500 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-blue-600 transition-colors shadow-md"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-white text-blue-500 px-8 py-3 rounded-xl text-lg font-medium hover:bg-gray-50 transition-colors shadow-md ml-4"
              >
                Register
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/chat')}
              className="bg-blue-500 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-blue-600 transition-colors shadow-md"
            >
              Start Chatting
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
