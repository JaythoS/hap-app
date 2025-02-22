"use client"

import Image from "next/image"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [profileType, setProfileType] = useState("user")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor")
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password, profileType }),
      })

      if (response.ok) {
        // Kayıt başarılı olduğunda direkt login sayfasına yönlendir
        router.push('/')
      } else {
        const data = await response.json()
        setError(data.error || 'Kayıt başarısız')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-4">
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
              type="text"
              placeholder="İSİM"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-14 rounded-full border-2 border-[#0066B3] bg-[#FFA500] text-black placeholder:text-black font-medium text-center"
              required
            />
            <Input
              type="text"
              placeholder="SOYİSİM"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-14 rounded-full border-2 border-[#0066B3] bg-[#FFA500] text-black placeholder:text-black font-medium text-center"
              required
            />
            <Input
              type="email"
              placeholder="E-POSTA"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-full border-2 border-[#0066B3] bg-[#FFA500] text-black placeholder:text-black font-medium text-center"
              required
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="ŞİFRE"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-full border-2 border-[#0066B3] bg-[#FFA500] text-black placeholder:text-black font-medium text-center"
                required
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
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="ŞİFRE TEKRAR"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-14 rounded-full border-2 border-[#0066B3] bg-[#FFA500] text-black placeholder:text-black font-medium text-center"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Profil tipi seçimi */}
            <div className="flex flex-col space-y-2 p-4 border-2 border-[#0066B3] rounded-xl bg-[#FFA500]">
              <div className="text-black font-medium text-center mb-2">PROFİL TİPİ</div>
              <div className="flex justify-between px-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="profileType"
                    value="user"
                    checked={profileType === "user"}
                    onChange={(e) => setProfileType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-black">Kullanıcı Profili</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="profileType"
                    value="project"
                    checked={profileType === "project"}
                    onChange={(e) => setProfileType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-black">Proje Profili</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="profileType"
                    value="sponsor"
                    checked={profileType === "sponsor"}
                    onChange={(e) => setProfileType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-black">Sponsor Profili</span>
                </label>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 rounded-full bg-[#0066B3] hover:bg-[#0055a4] text-white font-medium text-lg"
          >
            KAYDOL
          </Button>

          <Button 
            type="button"
            onClick={() => router.push('/')}
            className="w-full h-14 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-medium text-lg"
          >
            GİRİŞ SAYFASINA DÖN
          </Button>
        </form>

        {error && (
          <div className="text-red-500 text-center mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 