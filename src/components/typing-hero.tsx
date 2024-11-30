'use client'

import { useEffect, useState } from 'react'

export function TypingHero() {
  const [text, setText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const fullText = 'import { NextJS, Job }'

  useEffect(() => {
    let index = 0
    const startDelay = setTimeout(() => {
      const intervalId = setInterval(() => {
        setText(fullText.slice(0, index))
        index++
        if (index > fullText.length) {
          clearInterval(intervalId)
        }
      }, 150)

      return () => clearInterval(intervalId)
    }, 500)

    return () => clearTimeout(startDelay)
  }, [])

  useEffect(() => {
    const cursorIntervalId = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => clearInterval(cursorIntervalId)
  }, [])

  return (
    <section className="text-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 p-8 min-w-[500px] rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="font-mono text-lg sm:text-xl md:text-2xl lg:text-3xl">
              <span className="text-purple-400">{text.slice(0, 6)}</span>
              <span className="text-white">{text.slice(6, 7)}</span>
              <span className="text-yellow-300">{text.slice(7, 8)}</span>
              <span className="text-white">{text.slice(8, 9)}</span>
              <span className="text-blue-300">{text.slice(9, 15)}</span>
              <span className="text-white">{text.slice(15, 16)}</span>
              <span className="text-blue-300">{text.slice(16, 21)}</span>
              <span className="text-yellow-300">
                {text.slice(-1) === '}' ? '}' : ''}
              </span>
              <span
                className={`inline-block w-[2px] h-5 ml-1 bg-green-400 ${
                  showCursor ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
