"use client"

import Image from "next/image"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, Briefcase, HandCoins } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [profileType, setProfileType] = useState("NORMAL")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Form validasyonları
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor!")
      return
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı!")
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError("Ad ve soyad alanları zorunludur!")
      return
    }

    setIsLoading(true)

    try {
      // Ad ve soyadı birleştir
      const adsoyad = `${firstName.trim()} ${lastName.trim()}`
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adsoyad,
          email: email.trim(),
          password,
          userType: profileType
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Başarılı kayıt - otomatik login yap
        const loginSuccess = await login(email.trim(), password)
        if (loginSuccess) {
          router.push('/frontend/mainPage')
        } else {
          router.push('/')
        }
      } else {
        setError(data.error || 'Kayıt olurken bir hata oluştu!')
      }
    } catch (error) {
      setError('Sunucu hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#1A1B1E] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo container */}
        <div className="w-full aspect-square max-w-[160px] mx-auto mb-8">
          <div className="relative w-full h-full">
            <Image
              src="/images/icon.png"
              alt="HAP Logo"
              fill={false}
              width={160}
              height={160}
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#2C2D31] p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold text-white text-center mb-8">Hesap Oluştur</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* İsim Soyisim */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    İsim
                  </label>
                  <Input
                    type="text"
                    placeholder="İsminiz"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 bg-[#1A1B1E] border-gray-600 text-white placeholder:text-gray-400"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Soyisim
                  </label>
                  <Input
                    type="text"
                    placeholder="Soyisminiz"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 bg-[#1A1B1E] border-gray-600 text-white placeholder:text-gray-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* E-posta */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  E-posta Adresi
                </label>
                <Input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-[#1A1B1E] border-gray-600 text-white placeholder:text-gray-400"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Şifre */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Şifre
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifreniz (en az 6 karakter)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-[#1A1B1E] border-gray-600 text-white placeholder:text-gray-400 pr-10"
                    required
                    disabled={isLoading}
                    minLength={6}
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

              {/* Şifre Tekrar */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Şifrenizi tekrar girin"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-[#1A1B1E] border-gray-600 text-white placeholder:text-gray-400 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Profil tipi seçimi */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Profil Tipi
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setProfileType("NORMAL")}
                    disabled={isLoading}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center space-y-3 hover:bg-[#2C2D31] disabled:opacity-50 ${
                      profileType === "NORMAL"
                        ? "border-blue-500 bg-[#2C2D31]"
                        : "border-gray-600 bg-[#1A1B1E]"
                    }`}
                  >
                    <div className={`p-3 rounded-full ${
                      profileType === "NORMAL" ? "bg-blue-500" : "bg-gray-700"
                    }`}>
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-white">Kullanıcı</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Projeleri keşfet
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileType("PROJE")}
                    disabled={isLoading}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center space-y-3 hover:bg-[#2C2D31] disabled:opacity-50 ${
                      profileType === "PROJE"
                        ? "border-blue-500 bg-[#2C2D31]"
                        : "border-gray-600 bg-[#1A1B1E]"
                    }`}
                  >
                    <div className={`p-3 rounded-full ${
                      profileType === "PROJE" ? "bg-blue-500" : "bg-gray-700"
                    }`}>
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-white">Proje</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Projeni paylaş ve destek bul
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileType("SPONSOR")}
                    disabled={isLoading}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center space-y-3 hover:bg-[#2C2D31] disabled:opacity-50 ${
                      profileType === "SPONSOR"
                        ? "border-blue-500 bg-[#2C2D31]"
                        : "border-gray-600 bg-[#1A1B1E]"
                    }`}
                  >
                    <div className={`p-3 rounded-full ${
                      profileType === "SPONSOR" ? "bg-blue-500" : "bg-gray-700"
                    }`}>
                      <HandCoins className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-white">Sponsor</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Projelere yatırım yap
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium transition-colors"
            >
              {isLoading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">Zaten hesabınız var mı?</p>
            <Button 
              type="button"
              onClick={() => router.push('/')}
              variant="ghost"
              className="mt-2 text-blue-400 hover:text-blue-300 font-medium"
              disabled={isLoading}
            >
              Giriş Yap
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 