"use client"

import Image from "next/image"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "./hooks/useAuth"

export default function LoginPage() {
  const router = useRouter()
  const { login, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email.trim() || !password.trim()) {
      setError("Email ve şifre alanları zorunludur!")
      return
    }

    setIsLoading(true)

    try {
      const success = await login(email.trim(), password)
      if (success) {
        router.push('/frontend/mainPage')
      } else {
        setError("Email veya şifre hatalı!")
      }
    } catch (error) {
      setError("Giriş yapılırken bir hata oluştu!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#1A1B1E] flex flex-col items-center justify-center px-4">
      {/* Main content */}
      <div className="w-full max-w-md space-y-8">
        {/* Logo container */}
        <div className="w-full aspect-square max-w-[200px] mx-auto mb-12">
          <div className="relative w-full h-full">
            <Image
              src="/images/icon.png"
              alt="HAP Logo"
              fill={false}
              width={200}
              height={200}
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#2C2D31] p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold text-white text-center mb-8">Giriş Yap</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  E-posta Adresi
                </label>
                <Input
                  type="email"
                  placeholder="E-posta adresinizi girin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-[#1A1B1E] border-gray-600 text-white placeholder:text-gray-400"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Şifre
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-[#1A1B1E] border-gray-600 text-white placeholder:text-gray-400 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium transition-colors"
            >
              {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">Hesabınız yok mu?</p>
            <Button 
              type="button"
              onClick={() => router.push('/frontend/registerPage')}
              variant="ghost"
              className="mt-2 text-blue-400 hover:text-blue-300 font-medium"
              disabled={isLoading}
            >
              Hemen Kaydol
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

