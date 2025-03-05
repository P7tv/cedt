"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/use-auth"
import { motion, AnimatePresence } from "framer-motion"

export default function Signup() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { register } = useAuth()

  // Form data
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    education_year: "",
    study_program: "",
    university: "",
    faculty: "",
    gpa: "",
    admission_rounds: [] as string[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target

    if (name === "admission-round") {
      setFormData((prev) => {
        if (checked) {
          return { ...prev, admission_rounds: [...prev.admission_rounds, value] }
        } else {
          return { ...prev, admission_rounds: prev.admission_rounds.filter((item) => item !== value) }
        }
      })
    } else {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    }
  }

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateStep1 = () => {
    if (formData.username.length < 6 || formData.username.length > 20) {
      setError("ชื่อผู้ใช้ต้องมีความยาว 6-20 ตัวอักษร")
      return false
    }

    if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      setError("ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น")
      return false
    }

    if (formData.password.length < 8) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (!formData.education_year) {
      setError("กรุณาเลือกชั้นปีการศึกษา")
      return false
    }

    if (!formData.study_program) {
      setError("กรุณาเลือกสายการเรียน")
      return false
    }

    return true
  }

  const nextStep = () => {
    setError("")

    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await register({
        username: formData.username,
        password: formData.password,
        education_year: formData.education_year,
        study_program: formData.study_program,
        university: formData.university,
        faculty: formData.faculty,
        gpa: formData.gpa,
        admission_rounds: formData.admission_rounds,
      })

      if (result.success) {
        router.push("/")
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("เกิดข้อผิดพลาดในการลงทะเบียน")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex mb-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex-1">
                <div className={`h-2 rounded-full mx-2 ${step >= item ? "bg-primary" : "bg-gray-200"}`}></div>
                <div
                  className={`text-center mt-2 text-sm ${step >= item ? "text-primary font-medium" : "text-gray-500"}`}
                >
                  {item === 1 ? "ข้อมูลบัญชี" : item === 2 ? "ข้อมูลการศึกษา" : "ข้อมูลเพิ่มเติม"}
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">สร้างบัญชีผู้ใช้</h2>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium">
                      ชื่อผู้ใช้ *
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="ตั้งชื่อผู้ใช้ของคุณ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">ใช้ตัวอักษรภาษาอังกฤษและตัวเลข 6-20 ตัว</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium">
                      รหัสผ่าน *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="ตั้งรหัสผ่าน"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">ใช้ตัวอักษรผสมตัวเลขอย่างน้อย 8 ตัว</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium">
                      ยืนยันรหัสผ่าน *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                      disabled={isLoading}
                    >
                      ถัดไป
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="education_year" className="block text-sm font-medium">
                      ชั้นปีการศึกษา *
                    </label>
                    <select
                      id="education_year"
                      name="education_year"
                      value={formData.education_year}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      required
                      disabled={isLoading}
                    >
                      <option value="">เลือกชั้นปี</option>
                      <option value="m4">มัธยมศึกษาปีที่ 4</option>
                      <option value="m5">มัธยมศึกษาปีที่ 5</option>
                      <option value="m6">มัธยมศึกษาปีที่ 6</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">สายการเรียน *</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="study_program"
                          value="science"
                          checked={formData.study_program === "science"}
                          onChange={handleRadioChange}
                          className="mr-2"
                          required
                          disabled={isLoading}
                        />
                        <span>วิทย์-คณิต</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="study_program"
                          value="arts-math"
                          checked={formData.study_program === "arts-math"}
                          onChange={handleRadioChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>ศิลป์-คำนวณ</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="study_program"
                          value="arts-lang"
                          checked={formData.study_program === "arts-lang"}
                          onChange={handleRadioChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>ศิลป์-ภาษา</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70"
                      disabled={isLoading}
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                      disabled={isLoading}
                    >
                      ถัดไป
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="university" className="block text-sm font-medium">
                      มหาวิทยาลัยที่สนใจ
                    </label>
                    <input
                      id="university"
                      name="university"
                      type="text"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder="ระบุมหาวิทยาลัยที่สนใจ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="faculty" className="block text-sm font-medium">
                      คณะและสาขาที่สนใจ
                    </label>
                    <input
                      id="faculty"
                      name="faculty"
                      type="text"
                      value={formData.faculty}
                      onChange={handleChange}
                      placeholder="ระบุคณะหรือสาขาที่สนใจ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="gpa" className="block text-sm font-medium">
                      เกรดเฉลี่ย
                    </label>
                    <input
                      id="gpa"
                      name="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">รอบที่สนใจ</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <label className="flex items-center p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="admission-round"
                          value="1"
                          checked={formData.admission_rounds.includes("1")}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>รอบที่ 1 Portfolio</span>
                      </label>
                      <label className="flex items-center p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="admission-round"
                          value="2"
                          checked={formData.admission_rounds.includes("2")}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>รอบที่ 2 Quota</span>
                      </label>
                      <label className="flex items-center p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="admission-round"
                          value="3"
                          checked={formData.admission_rounds.includes("3")}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>รอบที่ 3 Admission</span>
                      </label>
                      <label className="flex items-center p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="admission-round"
                          value="4"
                          checked={formData.admission_rounds.includes("4")}
                          onChange={handleCheckboxChange}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span>รอบที่ 4 Direct Admission</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70"
                      disabled={isLoading}
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
                      disabled={isLoading}
                    >
                      {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="text-center mt-6 text-sm">
            <span>มีบัญชีอยู่แล้ว? </span>
            <Link href="/login" className="text-primary hover:underline">
              เข้าสู่ระบบ
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

