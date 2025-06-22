"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Mail, Github, Instagram, Twitter, Linkedin, Calendar, Globe, Users, FolderOpenDot, ChevronRight } from "lucide-react"
import Header from "@/app/frontend/components/Header"
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
  teamMemberships?: {
    id: number
    role: 'LEADER' | 'ADMIN' | 'MEMBER'
    status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'REMOVED'
    joinedAt: string | null
    team: {
      id: number
      name: string
      project: {
        id: number
        projeAdi: string
        projeKonusu: string
        resim: string | null
      }
    }
  }[]
  sponsors?: {
    id: number
    sponsorAdi: string
    resim: string | null
    hakkimizda: string | null
    website: string | null
    email: string
    telefon: string | null
    createdAt: string
  }[]
  createdAt: string
  updatedAt: string
}

export default function PublicUserProfile({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const resolvedParams = await params
        const userId = resolvedParams.id

        if (!userId || isNaN(parseInt(userId))) {
          setError('Geçersiz kullanıcı ID!')
          return
        }

        const response = await fetch(`/api/user/${userId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Kullanıcı bulunamadı!')
          } else {
            setError('Kullanıcı bilgileri yüklenemedi!')
          }
          return
        }
        
        const data = await response.json()
        setUserData(data)
      } catch (err) {
        setError('Bir hata oluştu!')
        console.error('User fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] text-white">
        <Header />
        <main className="px-4 py-6 max-w-4xl mx-auto pb-20">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Kullanıcı bilgileri yükleniyor...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] text-white">
        <Header />
        <main className="px-4 py-6 max-w-4xl mx-auto pb-20">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error || 'Kullanıcı bulunamadı!'}</p>
              <button 
                onClick={() => router.back()}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                Geri Dön
              </button>
            </div>
          </div>
        </main>
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

  // Aktif takım üyeliklerini filtrele
  const activeTeamMemberships = userData.teamMemberships?.filter(
    membership => membership.status === 'ACTIVE'
  ) || []

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
                  {userData.userType === 'PROJE' ? 'Proje Hesabı' : 
                   userData.userType === 'SPONSOR' ? 'Sponsor Hesabı' : 'Kullanıcı'}
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

        {/* Active Team Projects */}
        {activeTeamMemberships.length > 0 && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FolderOpenDot className="w-5 h-5" />
              Aktif Projeler ({activeTeamMemberships.length})
            </h2>
            <div className="space-y-3">
              {activeTeamMemberships.map((membership) => (
                <div 
                  key={membership.id}
                  onClick={() => router.push(`/frontend/projectDetail/${membership.team.project.id}`)}
                  className="flex items-center gap-4 bg-[#1A1B1E] rounded-lg p-4 hover:bg-[#3C3D41] transition-colors cursor-pointer"
                >
                  <div className="relative w-12 h-12">
                    <Image
                      src={membership.team.project.resim || "/images/icon.png"}
                      alt={membership.team.project.projeAdi}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{membership.team.project.projeAdi}</h3>
                    <p className="text-sm text-gray-400">{membership.team.project.projeKonusu}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        membership.role === 'LEADER' ? 'bg-yellow-500/20 text-yellow-400' :
                        membership.role === 'ADMIN' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {membership.role === 'LEADER' ? '👑 Proje Lideri' :
                         membership.role === 'ADMIN' ? '🛡️ Yönetici' :
                         '👤 Takım Üyesi'}
                      </span>
                      {membership.joinedAt && (
                        <span className="text-xs text-gray-500">
                          {formatDate(membership.joinedAt)} tarihinde katıldı
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Links */}
        {(userData.github || userData.instagram || userData.twitter || userData.linkedin) && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
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

        {/* User's Sponsor Accounts */}
        {userData.sponsors && userData.sponsors.length > 0 && (
          <div className="bg-[#2C2D31] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Sponsor Hesapları ({userData.sponsors.length})
            </h2>
            <div className="space-y-3">
              {userData.sponsors.map((sponsor) => (
                <div 
                  key={sponsor.id}
                  onClick={() => router.push(`/frontend/sponsorDetail/${sponsor.id}`)}
                  className="flex items-center gap-4 bg-[#1A1B1E] rounded-lg p-4 hover:bg-[#3C3D41] transition-colors cursor-pointer"
                >
                  <div className="relative w-12 h-12">
                    <Image
                      src={sponsor.resim || "/images/icon.png"}
                      alt={sponsor.sponsorAdi}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{sponsor.sponsorAdi}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {sponsor.hakkimizda || "Sponsor hesabı"}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Katılım: {formatDate(sponsor.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-400">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 