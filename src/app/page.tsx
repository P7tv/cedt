"use client"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const autoSlideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const AUTO_SLIDE_INTERVAL = 5000
  const MANUAL_INTERACTION_DELAY = 7000 // Longer delay after manual interaction
  
  // Featured news/content data
  const featuredContent = [
    {
      title: "คณะวิศวกรรมศาสตร์ CEDT จุฬาฯ เปิดรับสมัครรอบ Portfolio",
      description: "เปิดรับนักเรียนที่มีความสามารถพิเศษด้านวิทยาศาสตร์และคณิตศาสตร์ ประจำปีการศึกษา 2567",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpaeCJZIBu6Gft1n7ka-lScQS5HoUQodlNlQ&s",
      link: "/guide"
    },
    {
      title: "CEDT INNOVATION SUMMIT 2025 HACKATHON",
      description: "ค่ายเรียนรู้วิทยาศาสตร์และเทคโนโลยีสำหรับนักเรียนระดับมัธยมศึกษาตอนปลาย",
      image: "https://www.camphub.in.th/wp-content/uploads/2025/02/posters-750x394.jpg",
      link: "/camp"
    },
    // {
    //   title: "แนวข้อสอบ TGAT/TPAT ปี 2567 มีอะไรเปลี่ยนแปลง",
    //   description: "เจาะลึกโครงสร้างข้อสอบและเนื้อหาที่ควรเตรียมตัวสำหรับการสอบเข้ามหาวิทยาลัย",
    //   image: "https://www.camphub.in.th/wp-content/uploads/2025/02/FE_CampHub.jpg",
    //   link: "/educate"
    // }
  ]

  // Auto-advance slider
 // Start or restart auto slide timer
 const startAutoSlideTimer = (delay = AUTO_SLIDE_INTERVAL) => {
  if (autoSlideTimeoutRef.current) {
    clearTimeout(autoSlideTimeoutRef.current)
  }
  
  autoSlideTimeoutRef.current = setTimeout(() => {
    setCurrentSlide((prevSlide) => 
      prevSlide === featuredContent.length - 1 ? 0 : prevSlide + 1
    )
    // Continue with regular interval after first advance
    startAutoSlideTimer(AUTO_SLIDE_INTERVAL)
  }, delay)
}

// Initialize auto slide on component mount
useEffect(() => {
    startAutoSlideTimer()
    
    // Clean up on unmount
    return () => {
      if (autoSlideTimeoutRef.current) {
        clearTimeout(autoSlideTimeoutRef.current)
      }
    }
  }, [featuredContent.length, startAutoSlideTimer])

// Handle manual navigation
const nextSlide = () => {
  setCurrentSlide((prevSlide) => 
    prevSlide === featuredContent.length - 1 ? 0 : prevSlide + 1
  )
  // Reset timer with longer delay after manual interaction
  startAutoSlideTimer(MANUAL_INTERACTION_DELAY)
}

const prevSlide = () => {
  setCurrentSlide((prevSlide) => 
    prevSlide === 0 ? featuredContent.length - 1 : prevSlide - 1
  )
  // Reset timer with longer delay after manual interaction
  startAutoSlideTimer(MANUAL_INTERACTION_DELAY)
}

// // Handle indicator click
// const goToSlide = (index: number) => {
//   setCurrentSlide(index)
//   // Reset timer with longer delay after manual interaction
//   startAutoSlideTimer(MANUAL_INTERACTION_DELAY)
// }


  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      {/* News Banner */}
      <div className="bg-primary/10 py-3 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <span className="font-medium text-primary mr-4 flex-shrink-0">ข่าวสารน่ารู้:</span>
            <div className="overflow-hidden relative w-full">
              <div className="whitespace-nowrap animate-marquee inline-block">
                <span className="inline-block mx-4">เปิดรับสมัคร TCAS รอบที่ 1 Portfolio แล้ววันนี้</span>
                <span className="inline-block mx-4">กำหนดการสอบ TGAT/TPAT ประจำปี 2567</span>
                <span className="inline-block mx-4">แนะนำการเตรียมตัวสอบเข้ามหาวิทยาลัยช่วงม.6</span>
                <span className="inline-block mx-4">ค่ายวิชาการเปิดรับสมัครช่วงปิดเทอม</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-xl shadow-lg">
            {/* Carousel */}
            <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full">
              {featuredContent.map((content, index) => (
                <motion.div 
                  key={index}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: currentSlide === index ? 1 : 0,
                    zIndex: currentSlide === index ? 10 : 0
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Image 
                    src={content.image} 
                    alt={content.title} 
                    fill 
                    className="object-cover" 
                    priority={index === 0}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                    <div className="max-w-3xl">
                      <motion.h2 
                        className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 20
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        {content.title}
                      </motion.h2>
                      <motion.p 
                        className="text-white/80 mb-4 max-w-2xl hidden md:block"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 20
                        }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        {content.description}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 20
                        }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <Link
                          href={content.link}
                          className="inline-flex items-center px-5 py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                        >
                          อ่านเพิ่มเติม
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Carousel Controls */}
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white rounded-full p-2 backdrop-blur-sm transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white rounded-full p-2 backdrop-blur-sm transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2">
                {featuredContent.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">เส้นทางสู่มหาวิทยาลัย</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">เรียนรู้และเตรียมตัว</h3>
                <p className="text-gray-600 mb-4">ค้นพบเนื้อหาการเรียนที่สำคัญ และแนวทางการเตรียมตัวสอบเข้ามหาวิทยาลัย</p>
                <Link href="/educate" className="text-primary font-medium inline-flex items-center hover:underline">
                  เรียนรู้เพิ่มเติม
                  <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-40 bg-gradient-to-r from-green-500 to-green-700 flex items-center justify-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">ค่ายวิชาการ</h3>
                <p className="text-gray-600 mb-4">ค้นหาและสมัครเข้าร่วมค่ายวิชาการจากมหาวิทยาลัยชั้นนำทั่วประเทศ</p>
                <Link href="/camp" className="text-primary font-medium inline-flex items-center hover:underline">
                  ดูค่ายทั้งหมด
                  <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-40 bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">ข้อมูลคณะและสาขา</h3>
                <p className="text-gray-600 mb-4">ค้นหาข้อมูลคณะและสาขาที่น่าสนใจ พร้อมคุณสมบัติการรับสมัคร</p>
                <Link href="/attribute" className="text-primary font-medium inline-flex items-center hover:underline">
                  ดูรายละเอียด
                  <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest News & Updates */}
      <section className="py-8 md:py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">ข่าวสารล่าสุด</h2>
            <Link href="#" className="text-primary font-medium hover:underline">ดูทั้งหมด</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1].map((item) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: item * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative h-48">
                  <Image 
                    src="https://acad.ssru.ac.th/useruploads/images/20240819/2024081917240553390944.png" 
                    alt="News image" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-5">
                  <div className="text-xs font-medium text-gray-500 mb-2">12 มกราคม 2567</div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">ประกาศผลคะแนน TGAT/TPAT ประจำปีการศึกษา 2567</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    ทปอ. ประกาศผลคะแนนการสอบ TGAT/TPAT ประจำปีการศึกษา 2567 แล้ว นักเรียนสามารถตรวจสอบคะแนนได้ที่เว็บไซต์ mytcas.com
                  </p>
                  <Link href="#" className="text-primary font-medium hover:underline">อ่านต่อ</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex items-center">
              <div className="p-8 md:p-12 md:w-2/3">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">เริ่มต้นเส้นทางสู่มหาวิทยาลัยในฝันของคุณ</h2>
                <p className="text-white/80 mb-6 max-w-2xl">
                  เตรียมความพร้อมสู่การสอบเข้ามหาวิทยาลัย เรียนรู้แนวทางการเตรียมตัว ค้นหาคณะที่ใช่ และวางแผนอนาคตการศึกษาของคุณ
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    href="/signup" 
                    className="px-6 py-3 bg-white text-primary font-medium rounded-full hover:bg-gray-100 transition-colors"
                  >
                    สมัครสมาชิก
                  </Link>
                  <Link 
                    href="/guide" 
                    className="px-6 py-3 bg-transparent text-white border border-white font-medium rounded-full hover:bg-white/10 transition-colors"
                  >
                    คู่มือการสอบ
                  </Link>
                </div>
              </div>
              <div className="hidden md:block md:w-1/3 h-72 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-52 h-52 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="w-40 h-40 bg-white/30 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21l-9-5 9-5 9 5-9 5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} DeK. แพลตฟอร์มการศึกษาต่อ | ข้อมูลทั้งหมดมีวัตถุประสงค์เพื่อการศึกษาเท่านั้น
          </div>
        </div>
      </footer>
    </main>
  )
}