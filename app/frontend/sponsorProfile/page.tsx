"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Mail, Github, Instagram, Twitter, Linkedin, Calendar, Camera, FolderOpenDot, Star, Plus, Globe, Phone, Building2 } from "lucide-react"
import Header from "@/app/frontend/components/Header"
import { useAuth } from "@/app/hooks/useAuth"
import { useState, useEffect } from "react"

interface SponsorData {
  id: number
  userId: number
  sponsorAdi: string
  resim?: string | null
  video?: string | null
  hakkimizda?: string | null
  email: string
  telefon?: string | null
  website?: string | null
  yatirimlar?: SponsorYatirim[]
  user?: {
    id: number
    adsoyad: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface SponsorYatirim {
  id: number
  yatirimMiktari: string
  yatirimTarihi: string
  status?: string
  proje: {
    id: number
    projeAdi: string
    projeKonusu: string
    takimAdi: string
  }
}

export default function SponsorProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [sponsorData, setSponsorData] = useState<SponsorData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      fetchSponsorData()
    }
  }, [user, loading])

  const fetchSponsorData = async () => {
    try {
      if (!user) {
        setError('Giriş yapmanız gerekli')
        return
      }

      // PROJE tipindeki kullanıcılar sponsor profiline erişemez
      if (user.userType === 'PROJE') {
        setError('Proje hesabı olan kullanıcılar sponsor profiline erişemez. Sadece proje oluşturabilirsiniz.')
        return
      }

      // Kullanıcının ID'si ile sponsor bilgilerini çek
      const response = await fetch(`/api/sponsors?userId=${user.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Henüz sponsor bilgilerinizi eklememişsiniz')
        } else {
          throw new Error('Sponsor bilgileri alınamadı')
        }
        return
      }

      const sponsorData = await response.json()
      setSponsorData(sponsorData)
      
    } catch (error: any) {
      console.error('Sponsor verileri yüklenemedi:', error)
      setError(error.message || 'Sponsor verileri yüklenemedi')
    } finally {
      setLoadingData(false)
    }
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

  const convertToEmbedUrl = (url: string) => {
    if (!url) return ''
    
    // YouTube URL'sini embed formatına çevir
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(youtubeRegex)
    
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
    
    // Vimeo için
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
    const vimeoMatch = url.match(vimeoRegex)
    
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }
    
    // Zaten embed URL'si ise olduğu gibi döndür
    if (url.includes('embed') || url.includes('player')) {
      return url
    }
    
    return url
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

  // PROJE tipindeki kullanıcılar için özel hata sayfası
  if (user && user.userType === 'PROJE') {
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

          <div className="bg-[#2C2D31] rounded-xl p-6 text-center">
            <Building2 className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-red-400">Erişim Engellendi</h2>
            <p className="text-gray-400 mb-4">
              Proje hesabı olan kullanıcılar sponsor profiline erişemez.
            </p>
            <p className="text-gray-300 mb-6">
              Sizin hesap tipiniz: <span className="text-blue-400 font-semibold">PROJE</span>
            </p>
            <button
              onClick={() => router.push('/frontend/addingproject')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Proje Oluştur
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (error && !sponsorData) {
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

          <div className="bg-[#2C2D31] rounded-xl p-6 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Sponsor Bilgileri Bulunamadı</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            
            <button
              onClick={() => router.push('/frontend/addingsponsor')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mx-auto"
            >
              <Plus className="w-5 h-5" />
              Sponsor Bilgileri Ekle
            </button>
          </div>
        </main>
      </div>
    )
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

        {/* Add/Edit Sponsor Info Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/frontend/addingsponsor')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            {sponsorData ? 'Sponsor Bilgilerini Düzenle' : 'Sponsor Bilgileri Ekle'}
          </button>
        </div>

        {sponsorData ? (
          <>
            {/* Profile Header */}
            <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="relative w-24 h-24">
                    {sponsorData.resim ? (
                      <img
                        src={sponsorData.resim}
                        alt={sponsorData.sponsorAdi}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/images/icon.png"
                        alt={sponsorData.sponsorAdi}
                        fill
                        className="rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{formatName(sponsorData.sponsorAdi)}</h1>
                  <div className="flex items-center gap-2 mt-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Katılım: {formatDate(sponsorData.createdAt)}</span>
                  </div>
                  
                  {/* Social Media Links */}
                  <div className="flex gap-3 mt-4">
                    <a href={`mailto:${sponsorData.email}`} className="p-2 bg-[#1A1B1E] rounded-full hover:bg-[#3C3D41]">
                      <Mail className="w-5 h-5" />
                    </a>
                    <a href={`https://${sponsorData.website}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1A1B1E] rounded-full hover:bg-[#3C3D41]">
                      <Globe className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Hakkımızda</h2>
              <p className="text-gray-300 leading-relaxed">
                {sponsorData.hakkimizda || "Henüz bir açıklama eklenmemiş."}
              </p>
            </div>

            {/* Video Section */}
            {sponsorData.video && (
              <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Tanıtım Videosu</h2>
                <div className="relative pt-[56.25%]">
                  <iframe
                    src={convertToEmbedUrl(sponsorData.video)}
                    className="absolute top-0 left-0 w-full h-full rounded-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title="Sponsor Tanıtım Videosu"
                  />
                </div>
              </div>
            )}

            {/* Sponsored Projects */}
            {sponsorData.yatirimlar && sponsorData.yatirimlar.filter(yatirim => yatirim.status === 'ACCEPTED').length > 0 && (
              <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-6">Sponsor Olunan Projeler</h2>
                <div className="space-y-4">
                  {sponsorData.yatirimlar.filter(yatirim => yatirim.status === 'ACCEPTED').map((yatirim) => (
                    <div 
                      key={yatirim.id}
                      onClick={() => router.push(`/frontend/projectDetail/${yatirim.proje.id}`)}
                      className="flex items-center gap-4 bg-[#1A1B1E] p-4 rounded-xl cursor-pointer hover:bg-[#3C3D41] transition-colors"
                    >
                      <div className="relative w-16 h-16">
                        <Image
                          src="/images/icon.png"
                          alt={yatirim.proje.projeAdi}
                          fill
                          className="rounded-xl object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{yatirim.proje.projeAdi}</h3>
                          <div className="flex items-center gap-1 bg-[#2C2D31] px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs">₺{Math.floor(parseFloat(yatirim.yatirimMiktari)).toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">{yatirim.proje.projeKonusu}</p>
                        <div className="text-xs text-blue-400 mt-1">
                          Yatırım: {formatDate(yatirim.yatirimTarihi)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-[#2C2D31] rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">İletişim Bilgileri</h2>
              <div className="space-y-4 text-gray-300">
                {sponsorData.website && (
                  <div>
                    <div className="font-medium mb-1">Website</div>
                    <a href={`https://${sponsorData.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {sponsorData.website}
                    </a>
                  </div>
                )}
                <div>
                  <div className="font-medium mb-1">E-posta</div>
                  <a href={`mailto:${sponsorData.email}`} className="text-blue-400 hover:underline flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {sponsorData.email}
                  </a>
                </div>
                {sponsorData.telefon && (
                  <div>
                    <div className="font-medium mb-1">Telefon</div>
                    <a href={`tel:${sponsorData.telefon}`} className="text-blue-400 hover:underline flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {sponsorData.telefon}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-[#2C2D31] rounded-xl p-6 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Sponsor Bilgileri Bulunamadı</h2>
            <p className="text-gray-400">Henüz sponsor bilgilerinizi eklememişsiniz.</p>
          </div>
        )}
      </main>
    </div>
  )
} 