"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProfileDropdown } from './profile-dropdown'
import { useAuth } from '@/hooks/use-auth'
import { Menu, X, Search } from 'lucide-react'
import Image from 'next/image'

export function Navigation() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Close menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Close menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navLinks = [
    { href: '/', label: 'NEWS' },
    { href: '/educate', label: 'Educate' },
    { href: '/guide', label: 'Guide' },
    { href: '/camp', label: 'Camp' },
    { href: '/interview', label: 'Interview' },
    { href: '/attribute', label: 'Attribute' },
  ]

  return (
    <nav className="bg-white shadow-sm relative z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            DeK.
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex ml-10 space-x-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === href ? 'text-gray-900 font-semibold' : 'text-gray-500'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 rounded-full py-1 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {!loading && (
            user ? (
              <div className="ml-4">
                <div className="h-8 w-8 rounded-full bg-gray-800 overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=32&width=32"
                    alt="Profile"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link 
                  href="/login" 
                  className="px-3 py-1 text-sm rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link 
                  href="/signup" 
                  className="px-3 py-1 text-sm rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-600 hover:text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full">
          <div className="px-4 py-2 border-t">
            <div className="relative my-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 px-3 pr-8 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </button>
            </div>
            
            <div className="space-y-2">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 rounded-md ${
                    pathname === href ? 'text-primary font-semibold' : 'text-gray-600'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/profile"
                  className={`block px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 rounded-md ${
                    pathname === '/profile' ? 'text-primary font-semibold' : 'text-gray-600'
                  }`}
                >
                  Profile
                </Link>
              )}
            </div>
            
            {!loading && !user && (
              <div className="flex flex-col space-y-2 mt-4 pb-2">
                <Link 
                  href="/login" 
                  className="w-full py-2 text-center text-sm rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link 
                  href="/signup" 
                  className="w-full py-2 text-center text-sm rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}