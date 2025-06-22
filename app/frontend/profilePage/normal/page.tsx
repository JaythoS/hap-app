"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Mail, Github, Instagram, Twitter, Linkedin, Calendar, Globe } from "lucide-react"
import Header from "@/app/frontend/components/Header"
import { useAuth } from "@/app/hooks/useAuth"
import { useState, useEffect } from "react"

interface UserData {
  id: number
  adsoyad: string
  email: string
  userType: string
  profilFoto?: string | null
  hakkimda?: string | null
  website?: string | null
  twitter?: string | null
  linkedin?: string | null
  instagram?: string | null
  github?: string | null
  createdAt: string
  updatedAt: string
}

export default function NormalProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && user) {
      fetchUserData()
    }
  }, [user, loading])

  const fetchUserData = async () => {
    try {
      if (!user) return

      // Kullanıcı verilerini getir
      const userResponse = await fetch(`/api/user/${user.id}`)
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUserData(userData)
      }
    } catch (error) {
      console.error('Kullanıcı verileri yüklenemedi:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/frontend/registerPage')
    return null
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] flex items-center justify-center">
        <div className="text-white">Kullanıcı verileri yüklenemedi.</div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR')
  }

  const formatName = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      <Header />
      
      <main className="px-4 py-6 max-w-4xl mx-auto pb-20">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Geri Dön
        </button>

        {/* Profile Header */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <Image
                src={userData.profilFoto || "/images/icon.png"}
                alt={formatName(userData.adsoyad)}
                fill
                className="rounded-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{formatName(userData.adsoyad)}</h1>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  Kullanıcı
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Katılım: {formatDate(userData.createdAt)}</span>
              </div>
              
              {/* Contact Info */}
              <div className="flex items-center gap-2 mt-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{userData.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Hakkımda</h2>
          <p className="text-gray-300 leading-relaxed">
            {userData.hakkimda || "Henüz bir açıklama eklenmemiş."}
          </p>
        </div>

        {/* Website Link */}
        {userData.website && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Website</h2>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <a 
                href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {userData.website}
              </a>
            </div>
          </div>
        )}

        {/* Social Media Links */}
        {(userData.github || userData.instagram || userData.twitter || userData.linkedin) && (
          <div className="bg-[#2C2D31] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Sosyal Medya</h2>
            <div className="flex gap-3">
              {userData.github && (
                <a 
                  href={userData.github.startsWith('http') ? userData.github : `https://${userData.github}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 p-3 bg-[#1A1B1E] rounded-lg hover:bg-[#3C3D41] transition-colors"
                >
                  <Github className="w-5 h-5" />
                  <span className="text-sm">GitHub</span>
                </a>
              )}
              {userData.instagram && (
                <a 
                  href={userData.instagram.startsWith('http') ? userData.instagram : `https://${userData.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 p-3 bg-[#1A1B1E] rounded-lg hover:bg-[#3C3D41] transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  <span className="text-sm">Instagram</span>
                </a>
              )}
              {userData.twitter && (
                <a 
                  href={userData.twitter.startsWith('http') ? userData.twitter : `https://${userData.twitter}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 p-3 bg-[#1A1B1E] rounded-lg hover:bg-[#3C3D41] transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  <span className="text-sm">Twitter</span>
                </a>
              )}
              {userData.linkedin && (
                <a 
                  href={userData.linkedin.startsWith('http') ? userData.linkedin : `https://${userData.linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 p-3 bg-[#1A1B1E] rounded-lg hover:bg-[#3C3D41] transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  <span className="text-sm">LinkedIn</span>
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 