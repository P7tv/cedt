"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Send, Mic, GraduationCap, FileText, School, Bot, Menu, X, HelpCircle, UserCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Educate() {
  const [activeTab, setActiveTab] = useState("general")
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "ai"; id: string }[]>([
    {
      text: "สวัสดีค่ะ 👋 ฉันเป็น AI ที่จะช่วยตอบคำถามเกี่ยวกับการเรียนต่อ การเตรียมตัวสอบ และแนะแนวการศึกษา คุณมีคำถามอะไรไหมคะ?",
      sender: "ai",
      id: "initial-message"
    },
  ])
  const [userInput, setUserInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([])
  

  // System prompt for the AI
  const systemPrompt = `คุณเป็น AI ที่เชี่ยวชาญด้านการแนะแนวการศึกษาในประเทศไทย
คุณมีความรู้เกี่ยวกับ:
- ระบบการศึกษาไทยและการสอบเข้ามหาวิทยาลัย
- ระบบ TCAS ทุกรอบ
- หลักสูตรและคณะต่างๆ ในมหาวิทยาลัย
- การเตรียมตัวสอบและการเรียน
- ทุนการศึกษาและโอกาสต่างๆ

คุณจะ:
1. ให้คำแนะนำที่เป็นประโยชน์และเป็นรูปธรรม
2. อธิบายอย่างละเอียดและเข้าใจง่าย
3. ให้ตัวอย่างและทางเลือกที่หลากหลาย
4. แนะนำแหล่งข้อมูลเพิ่มเติมที่น่าเชื่อถือ
5. ตอบคำถามด้วยข้อมูลที่ทันสมัยและถูกต้อง`
  
  // Close sidebar when window resizes to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Close sidebar when changing tabs on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [activeTab])

  const callTyphoonAPI = async (userMessage: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_TYPHOON_API_KEY
      const url = "https://api.opentyphoon.ai/v1/chat/completions"
      
      const newHistory = [...conversationHistory, { role: "user", content: userMessage }]
      setConversationHistory(newHistory)

      const messages = [
        { role: "system", content: systemPrompt },
        ...newHistory
      ]

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "typhoon-v2-70b-instruct",
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.05
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const aiMessage = data.choices[0].message.content
      
      // Update conversation history with AI response
      setConversationHistory([...newHistory, { role: "assistant", content: aiMessage }])
      
      return aiMessage
    } catch (error) {
      console.error("Error calling Typhoon API:", error)
      return "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง"
    }
  }

  // Function to generate a unique ID
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return
  
    // Add user message with unique ID
    const userMessageId = generateId();
    setMessages((prev) => [...prev, { text: userInput, sender: "user", id: userMessageId }])
    const currentInput = userInput
    setUserInput("")
    setIsTyping(true)
  
    try {
      const aiResponse = await callTyphoonAPI(currentInput)
      setIsTyping(false) // ปิดแอนิเมชันก่อนที่จะเพิ่มข้อความ AI
      setTimeout(() => {
        // Add AI message with unique ID
        const aiMessageId = generateId();
        setMessages((prev) => [...prev, { text: aiResponse, sender: "ai", id: aiMessageId }])
      }, 100) // เพิ่มการหน่วงเวลาเล็กน้อยเพื่อให้แน่ใจว่าแอนิเมชันหายไปก่อน
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
      setIsTyping(false)
      setMessages((prev) => [...prev, { 
        text: "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง", 
        sender: "ai", 
        id: generateId() 
      }])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Speech recognition functionality
  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('ขออภัย เบราว์เซอร์ของคุณไม่รองรับการรับรู้เสียง');
      return;
    }
    
    setIsRecording(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.onerror = () => {
      setIsRecording(false);
    };
    
    recognition.start();
  };

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  }

  const tabVariants = {
    inactive: { backgroundColor: "#f3f4f6", color: "#374151" },
    active: { backgroundColor: "#3b82f6", color: "#ffffff" }
  }

  // Page transitions
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  // Tab definitions for reuse
  const tabs = [
    {
      id: "general",
      icon: <GraduationCap size={20} />,
      title: "แนะแนวทั่วไป",
      description: "ข้อมูลพื้นฐานการศึกษาต่อ"
    },
    {
      id: "tcas",
      icon: <FileText size={20} />,
      title: "ระบบ TCAS",
      description: "ข้อมูลการรับสมัครทุกรอบ"
    },
    {
      id: "faculty",
      icon: <School size={20} />,
      title: "คณะ/สาขา",
      description: "ข้อมูลคณะและสาขาวิชา"
    },
    {
      id: "ai-guide",
      icon: <Bot size={20} />,
      title: "แนะแนวกับ AI",
      description: "ปรึกษาการเรียนต่อกับ AI"
    }
  ]

  return (
    <motion.main 
      className="min-h-screen flex flex-col bg-gray-50"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <Navigation />

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 relative">
        {/* Mobile tab selector */}
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="font-bold text-lg">{tabs.find(tab => tab.id === activeTab)?.title || "แนะแนวการศึกษา"}</h2>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-white shadow-sm"
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-medium text-lg">หัวข้อ</h3>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div>{tab.icon}</div>
                <div>
                  <div className="font-medium">{tab.title}</div>
                  <div className="text-xs opacity-80">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {/* Desktop sidebar */}
          <div className="hidden md:block md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
              <h3 className="font-medium text-lg mb-4">หัวข้อ</h3>

              <div className="space-y-2">
                {tabs.map(tab => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-left"
                    variants={tabVariants}
                    animate={activeTab === tab.id ? "active" : "inactive"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tab.icon}
                    <div>
                      <div className="font-medium">{tab.title}</div>
                      <div className="text-xs opacity-80">{tab.description}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "ai-guide" ? (
                <motion.div 
                  key="ai-guide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden h-[500px] md:h-[600px] flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-slate-50">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
                          variants={messageVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          {message.sender === "ai" && (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 mr-2 flex-shrink-0 flex items-center justify-center">
                              <Bot size={20} className="text-white" />
                            </div>
                          )}

                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`max-w-[80%] sm:max-w-[70%] rounded-lg p-3 sm:p-4 ${
                              message.sender === "user"
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                                : "bg-white text-gray-800 border border-gray-200 shadow-sm"
                            }`}
                          >
                            <p className="whitespace-pre-line text-sm sm:text-base">{message.text}</p>
                          </motion.div>

                          {message.sender === "user" && (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-green-500 to-teal-500 ml-2 flex-shrink-0 flex items-center justify-center">
                              <UserCircle size={20} className="text-white" />
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {isTyping && (
                        <motion.div 
                          className="flex justify-start mb-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key="typing-indicator"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 mr-2 flex-shrink-0 flex items-center justify-center">
                            <Bot size={20} className="text-white" />
                          </div>
                          <div className="bg-white text-gray-800 rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div className="flex space-x-2">
                              <motion.div 
                                className="w-2 h-2 bg-blue-500 rounded-full"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                              ></motion.div>
                              <motion.div 
                                className="w-2 h-2 bg-indigo-500 rounded-full"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                              ></motion.div>
                              <motion.div 
                                className="w-2 h-2 bg-purple-500 rounded-full"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                              ></motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </AnimatePresence>
                  </div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 border-t border-gray-200 bg-white flex items-center space-x-2"
                  >
                    <motion.button 
                      className={`p-2 rounded-full ${
                        isRecording 
                          ? "bg-red-100 text-red-600" 
                          : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                      } transition-colors`}
                      whileHover={{ scale: isRecording ? 1 : 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={startSpeechRecognition}
                      title={isRecording ? "กำลังฟัง..." : "พูดข้อความ"}
                    >
                      <Mic size={20} className={`sm:w-5 sm:h-5 ${isRecording ? "animate-pulse" : ""}`} />
                    </motion.button>
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="พิมพ์ข้อความของคุณ..."
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                    <motion.button
                      onClick={handleSendMessage}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-3 rounded-full ${
                        !userInput.trim() || isTyping
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:opacity-90"
                      } transition-all`}
                      disabled={!userInput.trim() || isTyping}
                    >
                      <Send size={18} className="sm:w-5 sm:h-5" />
                    </motion.button>
                  </motion.div>
                  
                  {/* Help Section */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center text-xs text-gray-500">
                      <HelpCircle size={14} className="mr-1" />
                      <span>คำแนะนำ:</span>
                      <div className="ml-2 flex flex-wrap gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setUserInput("ระบบ TCAS คืออะไร")}
                          className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                        >
                          ระบบ TCAS
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setUserInput("คณะอะไรเหมาะกับคนชอบคณิตศาสตร์")}
                          className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                        >
                          คณะที่เหมาะกับฉัน
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setUserInput("แนะนำทุนการศึกษาหน่อย")}
                          className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                        >
                          ทุนการศึกษา
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === "general" ? (
                <motion.div 
                  key="general"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">แนะแนวทั่วไป</h2>

                  <div className="prose max-w-none">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">การเตรียมตัวเรียนต่อระดับมหาวิทยาลัย</h3>
                    <p className="mb-4 text-sm sm:text-base">
                      การเตรียมตัวเรียนต่อระดับมหาวิทยาลัยเป็นช่วงเวลาสำคัญของนักเรียนมัธยมปลาย ซึ่งต้องวางแผนและเตรียมตัวอย่างรอบคอบ
                    </p>

                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <h4 className="text-base sm:text-lg font-medium mb-2">ขั้นตอนการเตรียมตัว</h4>
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>ค้นหาความสนใจและความถนัดของตนเอง</li>
                        <li>ศึกษาข้อมูลคณะและสาขาวิชาที่สนใจ</li>
                        <li>ตรวจสอบคุณสมบัติและเกณฑ์การรับสมัคร</li>
                        <li>วางแผนการเรียนและการสอบ</li>
                        <li>เตรียมแฟ้มสะสมผลงาน (Portfolio)</li>
                      </ul>
                    </motion.div>

                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h4 className="text-base sm:text-lg font-medium mb-2">ปัจจัยในการเลือกคณะ/สาขา</h4>
                      <ul className="list-disc pl-6 mb-4 space-y-1 text-sm sm:text-base">
                        <li>ความสนใจและความถนัด</li>
                        <li>โอกาสในการประกอบอาชีพ</li>
                        <li>ความต้องการของตลาดแรงงาน</li>
                        <li>ค่าใช้จ่ายในการศึกษา</li>
                        <li>ทำเลที่ตั้งของสถาบัน</li>
                      </ul>
                    </motion.div>
                  </div>
                </motion.div>
              ) : activeTab === "tcas" ? (
                <motion.div 
                  key="tcas"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">ระบบ TCAS</h2>

                  <div className="prose max-w-none">
                    <p className="mb-4 text-sm sm:text-base">
                      TCAS (Thai University Central Admission System) คือระบบการคัดเลือกบุคคลเข้าศึกษาในสถาบันอุดมศึกษา แบ่งเป็น 4
                      รอบหลัก
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                      <motion.div 
                        className="bg-blue-50 p-3 sm:p-4 rounded-lg"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <h4 className="text-base sm:text-lg font-medium mb-2 text-blue-700">รอบที่ 1: Portfolio</h4>
                        <p className="text-xs sm:text-sm">พิจารณาจากแฟ้มสะสมผลงาน ความสามารถพิเศษ หรือโควตาพิเศษของมหาวิทยาลัย</p>
                        <div className="mt-2 text-xs text-blue-600">ช่วงเวลา: ตุลาคม - ธันวาคม</div>
                      </motion.div>

                      <motion.div 
                        className="bg-green-50 p-3 sm:p-4 rounded-lg"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <h4 className="text-base sm:text-lg font-medium mb-2 text-green-700">รอบที่ 2: Quota</h4>
                        <p className="text-xs sm:text-sm">โควตาพื้นที่ โควตาโรงเรียน หรือโควตาตามข้อตกลงของมหาวิทยาลัย</p>
                        <div className="mt-2 text-xs text-green-600">ช่วงเวลา: กุมภาพันธ์ - เมษายน</div>
                      </motion.div>

                      <motion.div 
                        className="bg-purple-50 p-3 sm:p-4 rounded-lg"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <h4 className="text-base sm:text-lg font-medium mb-2 text-purple-700">รอบที่ 3: Admission</h4>
                        <p className="text-xs sm:text-sm">ใช้คะแนนสอบ TGAT/TPAT และ A-Level ตามองค์ประกอบและค่าน้ำหนักที่สาขาวิชากำหนด</p>
                        <div className="mt-2 text-xs text-purple-600">ช่วงเวลา: พฤษภาคม</div>
                      </motion.div>

                      <motion.div 
                        className="bg-orange-50 p-3 sm:p-4 rounded-lg"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <h4 className="text-base sm:text-lg font-medium mb-2 text-orange-700">รอบที่ 4: Direct Admission</h4>
                        <p className="text-xs sm:text-sm">รับตรงอิสระ โดยมหาวิทยาลัยกำหนดเกณฑ์การรับสมัครเอง</p>
                        <div className="mt-2 text-xs text-orange-600">ช่วงเวลา: มิถุนายน</div>
                      </motion.div>
                    </div>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="text-lg sm:text-xl font-semibold mb-3">การเตรียมตัวสอบ</h3>
                      <p className="mb-4 text-sm sm:text-base">
                        นักเรียนควรเตรียมตัวสอบ TGAT/TPAT และ A-Level ซึ่งเป็นการสอบกลางที่ใช้ในการคัดเลือกรอบที่ 3 Admission
                      </p>

                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
                        <h4 className="text-base sm:text-lg font-medium mb-2">TGAT (Thai General Aptitude Test)</h4>
                        <ul className="list-disc pl-5 sm:pl-6 space-y-1 text-sm">
                          <li>TGAT1: การสื่อสารภาษาอังกฤษ</li>
                          <li>TGAT2: การคิดอย่างมีเหตุผล</li>
                          <li>TGAT3: สมรรถนะการทำงาน</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="text-base sm:text-lg font-medium mb-2">TPAT (Thai Professional Aptitude Test)</h4>
                        <ul className="list-disc pl-5 sm:pl-6 space-y-1 text-sm">
                          <li>TPAT1: ความถนัดทางแพทยศาสตร์ (กสพท.)</li>
                          <li>TPAT2: ความถนัดทางศิลปกรรม</li>
                          <li>TPAT3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์</li>
                          <li>TPAT4: ความถนัดทางสถาปัตยกรรม</li>
                          <li>TPAT5: ความถนัดครุศาสตร์-ศึกษาศาสตร์</li>
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="faculty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6"
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">คณะและสาขาวิชา</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <motion.div
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    >
                      <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <School size={36} className="sm:w-12 sm:h-12" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">คณะวิศวกรรมศาสตร์</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">ศึกษาเกี่ยวกับการออกแบบ พัฒนา และแก้ไขปัญหาทางวิศวกรรม</p>
                        <div className="text-xs text-gray-500">
                          <div className="mb-1">
                            <span className="font-medium">สาขายอดนิยม:</span> วิศวกรรมคอมพิวเตอร์, วิศวกรรมไฟฟ้า, วิศวกรรมโยธา
                          </div>
                          <div>
                            <span className="font-medium">อาชีพที่เกี่ยวข้อง:</span> วิศวกร, นักพัฒนาซอฟต์แวร์, ผู้จัดการโครงการ
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    >
                      <div className="h-32 sm:h-40 bg-gradient-to-r from-green-500 to-teal-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <GraduationCap size={36} className="sm:w-12 sm:h-12" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">คณะแพทยศาสตร์</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">ศึกษาเกี่ยวกับการรักษาและดูแลสุขภาพของมนุษย์</p>
                        <div className="text-xs text-gray-500">
                          <div className="mb-1">
                            <span className="font-medium">สาขายอดนิยม:</span> แพทยศาสตร์, รังสีวิทยา, วิสัญญีวิทยา
                          </div>
                          <div>
                            <span className="font-medium">อาชีพที่เกี่ยวข้อง:</span> แพทย์, นักวิจัยทางการแพทย์, อาจารย์แพทย์
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    >
                      <div className="h-32 sm:h-40 bg-gradient-to-r from-red-500 to-pink-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <FileText size={36} className="sm:w-12 sm:h-12" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">คณะบริหารธุรกิจ</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">ศึกษาเกี่ยวกับการบริหารจัดการองค์กรและธุรกิจ</p>
                        <div className="text-xs text-gray-500">
                          <div className="mb-1">
                            <span className="font-medium">สาขายอดนิยม:</span> การตลาด, การบัญชี, การจัดการทรัพยากรมนุษย์
                          </div>
                          <div>
                            <span className="font-medium">อาชีพที่เกี่ยวข้อง:</span> นักธุรกิจ, นักการตลาด, ผู้จัดการฝ่ายบุคคล
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    >
                      <div className="h-32 sm:h-40 bg-gradient-to-r from-yellow-500 to-amber-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <Bot size={36} className="sm:w-12 sm:h-12" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">คณะวิทยาศาสตร์</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">ศึกษาเกี่ยวกับทฤษฎีและการทดลองทางวิทยาศาสตร์</p>
                        <div className="text-xs text-gray-500">
                          <div className="mb-1">
                            <span className="font-medium">สาขายอดนิยม:</span> วิทยาการคอมพิวเตอร์, ชีววิทยา, เคมี
                          </div>
                          <div>
                            <span className="font-medium">อาชีพที่เกี่ยวข้อง:</span> นักวิทยาศาสตร์, นักวิจัย, นักพัฒนาซอฟต์แวร์
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="mt-6 sm:mt-8">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">กลุ่มคณะยอดนิยม</h3>

                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                        <table className="min-w-full bg-white border border-gray-200 text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 sm:py-3 px-3 sm:px-4 text-left border-b font-medium">กลุ่มคณะ</th>
                              <th className="py-2 sm:py-3 px-3 sm:px-4 text-left border-b font-medium">วิชาสอบที่เกี่ยวข้อง</th>
                              <th className="py-2 sm:py-3 px-3 sm:px-4 text-left border-b font-medium">คะแนนเฉลี่ย</th>
                              <th className="py-2 sm:py-3 px-3 sm:px-4 text-left border-b font-medium">แนวโน้มตลาดงาน</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="hover:bg-gray-50">
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">วิศวกรรมศาสตร์</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">TGAT, TPAT3, A-Level (คณิตศาสตร์, ฟิสิกส์)</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">16,000 - 22,000</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">สูง</span>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">แพทยศาสตร์</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">TGAT, TPAT1, TPAT2, A-Level (ชีววิทยา, เคมี, ฟิสิกส์)</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">20,000 - 25,000</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">สูงมาก</span>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">บริหารธุรกิจ</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">TGAT, A-Level (คณิตศาสตร์, ภาษาอังกฤษ)</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">12,000 - 18,000</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">ปานกลาง</span>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">วิทยาศาสตร์</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">TGAT, TPAT2, A-Level (ตามสาขา)</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">13,000 - 19,000</td>
                              <td className="py-2 sm:py-3 px-3 sm:px-4 border-b">
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">ปานกลางถึงสูง</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.main>
  );
}