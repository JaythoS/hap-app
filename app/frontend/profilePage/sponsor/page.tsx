"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Mail, Github, Instagram, Twitter, Linkedin, Calendar, Camera, FolderOpenDot, Star, Building2 } from "lucide-react"
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
  projectIds: number[]
  createdAt: string
  updatedAt: string
}

interface SponsorData {
  id: number
  userId: number
  sponsorAdi: string
  resim?: string | null
  hakkimizda?: string | null
  email: string
  telefon?: string | null
  website?: string | null
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [sponsorData, setSponsorData] = useState<SponsorData | null>(null)
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

      // Sponsor verilerini getir
      try {
        const sponsorResponse = await fetch(`/api/sponsors?userId=${user.id}`)
        if (sponsorResponse.ok) {
          const sponsorData = await sponsorResponse.json()
          setSponsorData(sponsorData)
        }
      } catch (sponsorError) {
        // Sponsor bulunamadığında hata vermemesi için catch bloğu
        console.log('Bu kullanıcıya ait sponsor hesabı bulunamadı')
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

        {/* Sponsor Header */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="relative w-24 h-24">
                <Image
                  src={userData.profilFoto || "/images/icon.png"}
                  alt={formatName(userData.adsoyad)}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{formatName(userData.adsoyad)}</h1>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Sponsor Hesabı</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Katılım: {formatDate(userData.createdAt)}</span>
              </div>
              
              {/* Social Media Links */}
              <div className="flex gap-3 mt-4">
                <a href={`mailto:${userData.email}`} className="p-2 bg-[#1A1B1E] rounded-full hover:bg-[#3C3D41]">
                  <Mail className="w-5 h-5" />
                </a>
                {userData.github && (
                  <a href={userData.github.startsWith('http') ? userData.github : `https://${userData.github}`} 
                     target="_blank" rel="noopener noreferrer" 
                     className="p-2 bg-[#1A1B1E] rounded-full hover:bg-[#3C3D41]">
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {userData.instagram && (
                  <a href={userData.instagram.startsWith('http') ? userData.instagram : `https://${userData.instagram}`} 
                     target="_blank" rel="noopener noreferrer" 
                     className="p-2 bg-[#1A1B1E] rounded-full hover:bg-[#3C3D41]">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {userData.twitter && (
                  <a href={userData.twitter.startsWith('http') ? userData.twitter : `https://${userData.twitter}`} 
                     target="_blank" rel="noopener noreferrer" 
                     className="p-2 bg-[#1A1B1E] rounded-full hover:bg-[#3C3D41]">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {userData.linkedin && (
                  <a href={userData.linkedin.startsWith('http') ? userData.linkedin : `https://${userData.linkedin}`} 
                     target="_blank" rel="noopener noreferrer" 
                     className="p-2 bg-[#1A1B1E] rounded-full hover:bg-[#3C3D41]">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Hakkımızda</h2>
          <p className="text-gray-300 leading-relaxed">
            {userData.hakkimda || "Henüz bir açıklama eklenmemiş."}
          </p>
        </div>

        {/* Website Link */}
        {userData.website && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Website</h2>
            <a 
              href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {userData.website}
            </a>
          </div>
        )}

        {/* Sponsor Accounts Section */}
        <div className="bg-[#2C2D31] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Sponsor Hesapları</h2>
          {sponsorData ? (
            <div className="flex items-center gap-4 p-4 bg-[#1A1B1E] rounded-lg cursor-pointer hover:bg-[#232327] transition-colors"
                 onClick={() => router.push(`/frontend/sponsorDetail/${sponsorData.id}`)}>
              <div className="relative w-16 h-16">
                <Image
                  src={sponsorData.resim || "/images/icon.png"}
                  alt={sponsorData.sponsorAdi}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg">{sponsorData.sponsorAdi}</h3>
                <p className="text-sm text-gray-400">Sponsor Hesabı</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Henüz sponsor hesabı yok</h3>
              <p className="text-gray-400 mb-4">Sponsor hesabı oluşturmak için aşağıdaki butona tıklayın.</p>
              <button
                onClick={() => router.push('/frontend/addingsponsor')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sponsor Hesabı Oluştur
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}