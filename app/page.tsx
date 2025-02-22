"use client"

import Image from "next/image"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import useAuth from "@/app/hooks/useAuth"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await auth.login(email, password)
      const initialRoute = auth.getInitialRoute()
      router.push(initialRoute)
    } catch (err) {
      setError('Giriş başarısız')
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-4">
      {/* Main content */}
      <div className="w-full max-w-md space-y-8">
        {/* Logo container */}
        <div className="w-full aspect-square max-w-[280px] mx-auto mb-8 rounded-3xl overflow-hidden">
          <div className="relative w-full h-full bg-[#1a1a2e]">
            <Image
              src="/images/icon.png"
              alt="HAP Logo"
              fill={false}
              width={280}
              height={280}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="E-POSTA"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-full border-2 border-[#0066B3] bg-[#FFA500] text-black placeholder:text-black font-medium text-center"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="ŞİFRE"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-full border-2 border-[#0066B3] bg-[#FFA500] text-black placeholder:text-black font-medium text-center"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 rounded-full bg-[#0066B3] hover:bg-[#0055a4] text-white font-medium text-lg"
          >
            GİRİŞ YAP
          </Button>
        </form>

        <Button 
          type="button"
          onClick={() => router.push('/register')}
          className="w-full h-14 rounded-full bg-[#0066B3] hover:bg-[#0055a4] text-white font-medium text-lg"
        >
          KAYDOL
        </Button>

        {error && (
          <div className="text-red-500 text-center mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

