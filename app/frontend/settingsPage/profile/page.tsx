"use client"

import { useState, useEffect, type ReactElement } from "react"
import { ArrowLeft, Camera, Plus, X, Twitter, Instagram, Facebook, Linkedin, Github, Youtube, Pencil, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import Header from "@/app/frontend/components/Header"
import { useAuth } from "@/app/hooks/useAuth"
import Image from "next/image"

type SocialPlatform = {
  value: string;
  label: string;
  icon: ReactElement;
}

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

export default function ProfileSettings() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const socialPlatforms: SocialPlatform[] = [
    { value: "twitter", label: "Twitter", icon: <Twitter className="w-5 h-5" /> },
    { value: "instagram", label: "Instagram", icon: <Instagram className="w-5 h-5" /> },
    { value: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-5 h-5" /> },
    { value: "github", label: "GitHub", icon: <Github className="w-5 h-5" /> },
  ]

  useEffect(() => {
    if (!loading && user) {
      fetchUserData()
    }
  }, [user, loading])

  const fetchUserData = async () => {
    try {
      if (!user) return

      const response = await fetch(`/api/user/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error('Kullanıcı verileri yüklenemedi:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const formatName = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR')
  }

  const getSocialMediaValue = (platform: string) => {
    if (!userData) return null
    
    switch (platform) {
      case 'twitter':
        return userData.twitter
      case 'instagram':
        return userData.instagram
      case 'linkedin':
        return userData.linkedin
      case 'github':
        return userData.github
      default:
        return null
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

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      <Header />
      
      <main className="px-4 py-6 max-w-4xl mx-auto pb-20">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Geri Dön
        </button>

        <h1 className="text-2xl font-bold mb-6">Profil Bilgileri</h1>

        <div className="bg-[#2C2D31] rounded-xl p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#1A1B1E] overflow-hidden">
                <Image
                  src={userData.profilFoto || "/images/icon.png"}
                  alt={formatName(userData.adsoyad)}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold">{formatName(userData.adsoyad)}</h2>
              <span className="text-sm bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full mt-2 inline-block">
                {userData.userType === 'PROJE' ? 'Proje Hesabı' : 
                 userData.userType === 'SPONSOR' ? 'Sponsor Hesabı' : 'Normal hesap'}
              </span>
              <div className="flex items-center justify-center gap-2 mt-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Katılım: {formatDate(userData.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Ad Soyad
              </label>
              <div className="w-full px-4 py-2 bg-[#1A1B1E] rounded-lg border border-gray-700">
                {formatName(userData.adsoyad)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                E-posta
              </label>
              <div className="w-full px-4 py-2 bg-[#1A1B1E] rounded-lg border border-gray-700">
                {userData.email}
              </div>
            </div>

            {userData.website && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Website
                </label>
                <div className="w-full px-4 py-2 bg-[#1A1B1E] rounded-lg border border-gray-700">
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

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Hakkımda
              </label>
              <div className="w-full px-4 py-2 bg-[#1A1B1E] rounded-lg border border-gray-700 min-h-[96px]">
                {userData.hakkimda || "Henüz bir açıklama eklenmemiş."}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium mb-4">Sosyal Medya Hesapları</h3>
              
              <div className="space-y-3">
                {socialPlatforms.map((platform) => {
                  const socialValue = getSocialMediaValue(platform.value)
                  return (
                    <div
                      key={platform.value}
                      className="flex items-center justify-between bg-[#1A1B1E] p-4 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-[140px]">
                        {platform.icon}
                        <span className="font-medium">{platform.label}</span>
                      </div>
                      <div className="flex-1 px-4 py-2 bg-[#2C2D31] rounded-lg text-sm">
                        {socialValue ? (
                          <a 
                            href={socialValue.startsWith('http') ? socialValue : `https://${socialValue}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            {socialValue}
                          </a>
                        ) : (
                          <span className="text-gray-400">Henüz bağlantı eklenmedi</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block text-gray-400 mb-1">Hesap Türü</label>
                  <div className="text-white">
                    {userData.userType === 'PROJE' ? 'Proje Hesabı' : 
                     userData.userType === 'SPONSOR' ? 'Sponsor Hesabı' : 'Normal hesap'}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Son Güncelleme</label>
                  <div className="text-white">{formatDate(userData.updatedAt)}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => router.push('/frontend/settingsPage/profile/edit')}
                className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Düzenle
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 