"use client"

import { useState, useRef, useEffect, ReactNode } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { motion, AnimatePresence } from "framer-motion"

interface ProfileDropdownProps {
  icon: ReactNode;
}

export function ProfileDropdown({ icon }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 focus:outline-none focus:border-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
          >
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              โปรไฟล์
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              ออกจากระบบ
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

