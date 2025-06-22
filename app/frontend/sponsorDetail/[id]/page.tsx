"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Users, Mail, Phone, Globe, ChevronRight, X, Building2, Calendar, Github, Instagram, Twitter, Linkedin } from "lucide-react"
import Header from "@/app/frontend/components/Header"
import { useState, useEffect, use } from "react"

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
    profilFoto: string | null
    hakkimda: string | null
    website: string | null
    twitter: string | null
    linkedin: string | null
    instagram: string | null
    github: string | null
    userType: string
    sponsors?: {
      id: number
      sponsorAdi: string
      resim: string | null
      hakkimizda: string | null
      website: string | null
      email: string
      telefon: string | null
    }[]
  }
  createdAt: string
  updatedAt: string
}

interface SponsorYatirim {
  id: number
  yatirimMiktari: string
  yatirimTarihi: string
  proje: {
    id: number
    projeAdi: string
    projeKonusu: string
    takimAdi: string
  }
}

export default function SponsorDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [sponsorData, setSponsorData] = useState<SponsorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSponsorData()
  }, [resolvedParams.id])

  const fetchSponsorData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sponsors?id=${resolvedParams.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Sponsor bulunamadı')
        } else {
          throw new Error('Sponsor bilgileri alınamadı')
        }
        return
      }

      const data = await response.json()
      setSponsorData(data)
      
    } catch (error: any) {
      console.error('Sponsor verileri yüklenemedi:', error)
      setError(error.message || 'Sponsor verileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR')
  }

  const formatCurrency = (amount: string) => {
    return '₺' + Math.floor(parseFloat(amount)).toLocaleString('tr-TR')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] flex items-center justify-center">
        <div className="text-white">Sponsor bilgileri yükleniyor...</div>
      </div>
    )
  }

  if (error || !sponsorData) {
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
            <h2 className="text-xl font-bold mb-2 text-red-400">Hata</h2>
            <p className="text-gray-400 mb-6">{error || 'Sponsor bulunamadı'}</p>
            <button
              onClick={() => router.push('/frontend/mainPage')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ana Sayfaya Dön
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

        {/* Sponsor Header */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <Image
                src={sponsorData.resim || "/images/icon.png"}
                alt={sponsorData.sponsorAdi}
                fill
                className="rounded-xl object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{sponsorData.sponsorAdi}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Katılım: {formatDate(sponsorData.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Hakkında</h2>
          <p className="text-gray-300 leading-relaxed">
            {sponsorData.hakkimizda || "Bu sponsor henüz hakkında bilgisi eklenmemiş."}
          </p>
        </div>

        {/* Sponsor Video */}
        {sponsorData.video && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Tanıtım Videosu</h2>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-[#1A1B1E]">
              <iframe
                src={convertToEmbedUrl(sponsorData.video)}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Sponsored Projects */}
        {sponsorData.yatirimlar && sponsorData.yatirimlar.length > 0 && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Yatırım Yapılan Projeler</h2>
            <div className="space-y-4">
              {sponsorData.yatirimlar.map((yatirim) => (
                <div key={yatirim.id} className="flex items-center justify-between bg-[#1A1B1E] rounded-lg p-4 cursor-pointer hover:bg-[#232327] transition-colors"
                     onClick={() => router.push(`/frontend/projectDetail/${yatirim.proje.id}`)}>
                  <div className="flex items-center">
                    <div className="relative w-10 h-10">
                      <Image
                        src="/images/icon.png"
                        alt={yatirim.proje.projeAdi}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{yatirim.proje.projeAdi}</div>
                      <div className="text-sm text-green-400">
                        Yatırım: {formatCurrency(yatirim.yatirimMiktari)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Tarih: {formatDate(yatirim.yatirimTarihi)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Projects Message */}
        {(!sponsorData.yatirimlar || sponsorData.yatirimlar.length === 0) && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Yatırım Yapılan Projeler</h2>
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-400">Henüz hiçbir projeye yatırım yapılmamış</p>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">İletişim Bilgileri</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <span>{sponsorData.email}</span>
            </div>
            {sponsorData.telefon && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-400" />
                <span>{sponsorData.telefon}</span>
              </div>
            )}
            {sponsorData.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-yellow-400" />
                <a 
                  href={sponsorData.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline text-blue-300 hover:text-blue-200"
                >
                  {sponsorData.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Sponsor Owner Info */}
        {sponsorData.user && (
          <div className="bg-[#2C2D31] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Sponsor Sahibi
            </h2>
            <div 
              onClick={() => router.push(`/frontend/user/${sponsorData.user!.id}`)}
              className="flex items-center justify-between bg-[#1A1B1E] rounded-lg p-4 hover:bg-[#3C3D41] transition-colors cursor-pointer"
            >
              <div className="flex items-center">
                <div className="relative w-12 h-12">
                  <Image
                    src={sponsorData.user.profilFoto || "/images/icon.png"}
                    alt={sponsorData.user.adsoyad}
                    fill
                    className="rounded-full object-cover border-2 border-gray-600"
                  />
                </div>
                
                <div className="ml-3">
                  <div className="font-medium">{sponsorData.user.adsoyad}</div>
                  <div className="text-sm text-gray-400">{sponsorData.user.email}</div>
                  <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full mt-1 inline-block">
                    🏢 Sponsor Hesabı
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-gray-400">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 