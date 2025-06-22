"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Mail, Github, Instagram, Twitter, Linkedin, Calendar, Camera, FolderOpenDot, Star } from "lucide-react"
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
  teamMemberships?: any[] // Takım üyelikleri
  createdAt: string
  updatedAt: string
}

interface Project {
  id: number
  projeAdi: string
  projeKonusu: string
  takimAdi: string
  takimKurulusYili: number
  takimEgitimSeviyesi: string
  katilimIli: string
  projeOzeti: string
  resim?: string | null
  sponsorYatirimlar?: {
    id: number
    yatirimMiktari: string
    status: string
    sponsor: {
      id: number
      sponsorAdi: string
    }
  }[]
  form?: any
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
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
        
        // Kullanıcının oluşturduğu projeleri getir
        const ownProjectsResponse = await fetch(`/api/projects?userId=${user.id}`)
        let ownProjects: Project[] = []
        if (ownProjectsResponse.ok) {
          ownProjects = await ownProjectsResponse.json()
        }
        
        // Takım üyesi olduğu projeleri getir
        let memberProjects: Project[] = []
        if (userData.teamMemberships && userData.teamMemberships.length > 0) {
          const activeAndPendingTeams = userData.teamMemberships.filter((tm: any) => 
            tm.status === 'ACTIVE' || tm.status === 'PENDING'
          )
          memberProjects = activeAndPendingTeams
            .map((tm: any) => tm.team?.project)
            .filter((project: any) => project && project.userId !== user.id) // Sahip olunan projeleri çıkar
        }

        // Sahip olunan ve üye olunan projeleri birleştir
        const allProjects = [...ownProjects, ...memberProjects]
        
        // Aynı projeleri tekrar eklemememek için ID'ye göre benzersiz hale getir
        const uniqueProjects = allProjects.filter((project, index, self) => 
          index === self.findIndex(p => p.id === project.id)
        )
        
        setProjects(uniqueProjects)
        console.log('All user projects:', uniqueProjects) // Debug için
      } else {
        console.error('Kullanıcı verileri yüklenemedi:', userResponse.status)
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

  // Para birimini formatla
  const formatCurrency = (amount: number) => {
    return '₺' + Math.floor(amount).toLocaleString('tr-TR')
  }

  // Tek bir proje için toplam yatırım miktarını hesapla
  const getProjectTotalInvestment = (project: Project) => {
    if (!project.sponsorYatirimlar) return 0
    const acceptedInvestments = project.sponsorYatirimlar.filter(yatirim => yatirim.status === 'ACCEPTED')
    return acceptedInvestments.reduce((total, investment) => {
      return total + parseFloat(investment.yatirimMiktari || '0')
    }, 0)
  }

  // Kullanıcının projede ki durumunu kontrol et
  const getUserStatusInProject = (project: Project) => {
    if (!userData?.teamMemberships || !user) return null
    
    // Kullanıcının bu projedeki team membership'ini bul
    const membership = userData.teamMemberships.find((tm: any) => 
      tm.team?.project?.id === project.id && tm.userId === user.id
    )
    
    return membership ? membership.status : null
  }

  const sponsoredProjects = projects.filter(project => {
    if (!project.sponsorYatirimlar) return false
    const acceptedInvestments = project.sponsorYatirimlar.filter(yatirim => yatirim.status === 'ACCEPTED')
    return acceptedInvestments.length > 0
  })

  const nonSponsoredProjects = projects.filter(project => {
    if (!project.sponsorYatirimlar) return true
    const acceptedInvestments = project.sponsorYatirimlar.filter(yatirim => yatirim.status === 'ACCEPTED')
    return acceptedInvestments.length === 0
  })

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
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                  {userData.userType === 'PROJE' ? 'Proje Hesabı' : 
                   userData.userType === 'SPONSOR' ? 'Sponsor Hesabı' : 'Normal Hesap'}
                </span>
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
          <h2 className="text-xl font-bold mb-4">Hakkımda</h2>
          <p className="text-gray-300 leading-relaxed">
            {userData.hakkimda || "Henüz bir açıklama eklenmemiş."}
          </p>
        </div>

        {/* Sponsored Projects */}
        {sponsoredProjects.length > 0 && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Sponsor Alınan Projeler</h2>
            <div className="space-y-4">
              {sponsoredProjects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => router.push(`/frontend/projectDetail/${project.id}`)}
                  className="flex items-center gap-4 bg-[#1A1B1E] p-4 rounded-xl cursor-pointer hover:bg-[#3C3D41] transition-colors"
                >
                  <div className="relative w-16 h-16">
                    <Image
                      src={project.resim || "/images/icon.png"}
                      alt={project.projeAdi}
                      fill
                      className="rounded-xl object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{project.projeAdi}</h3>
                      <div className="flex items-center gap-1 bg-[#2C2D31] px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs">{project.sponsorYatirimlar?.filter(yatirim => yatirim.status === 'ACCEPTED').length || 0}</span>
                      </div>
                      {getUserStatusInProject(project) === 'PENDING' && (
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
                          Davet Bekliyor
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{project.projeKonusu}</p>
                  </div>
                  <div className="bg-green-600 px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(getProjectTotalInvestment(project))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-Sponsored Projects */}
        {nonSponsoredProjects.length > 0 && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Diğer Projeler</h2>
            <div className="space-y-4">
              {nonSponsoredProjects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => router.push(`/frontend/projectDetail/${project.id}`)}
                  className="flex items-center gap-4 bg-[#1A1B1E] p-4 rounded-xl cursor-pointer hover:bg-[#3C3D41] transition-colors"
                >
                  <div className="relative w-16 h-16">
                    <Image
                      src={project.resim || "/images/icon.png"}
                      alt={project.projeAdi}
                      fill
                      className="rounded-xl object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{project.projeAdi}</h3>
                      {getUserStatusInProject(project) === 'PENDING' && (
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
                          Davet Bekliyor
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{project.projeKonusu}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Projects Message */}
        {projects.length === 0 && (
          <div className="bg-[#2C2D31] rounded-xl p-6 text-center">
            <FolderOpenDot className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Henüz proje yok</h3>
            <p className="text-gray-400">Projelere katıldığınızda burada görünecekler.</p>
          </div>
        )}

        {/* Website Link */}
        {userData.website && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mt-6">
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
      </main>
    </div>
  )
}