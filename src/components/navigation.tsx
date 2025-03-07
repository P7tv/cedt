"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProfileDropdown } from './profile-dropdown'
import { useAuth } from '@/hooks/use-auth'
import { Menu, X, Search } from 'lucide-react'

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
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                pathname === href ? 'text-primary font-semibold' : 'text-gray-500'
              }`}
            >
              {label}
            </Link>
          ))}
          {user && (
            <Link
              href="/profile"
              className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/profile' ? 'text-primary font-semibold' : 'text-gray-500'
              }`}
            >
              Profile
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search..."
              className="py-1 px-3 pr-8 rounded-full text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </button>
          </div>
          
          {!loading && (
            user ? (
              // We don't need to pass the icon anymore, it will be handled inside the component
              <ProfileDropdown />
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