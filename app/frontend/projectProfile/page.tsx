"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Star, Edit, FolderOpenDot, Users } from "lucide-react"
import Header from "@/app/frontend/components/Header"
import { useAuth } from "@/app/hooks/useAuth"
import { useState, useEffect } from "react"

interface Project {
  id: number
  projeAdi: string
  projeKonusu: string
  takimAdi: string
  takimKurulusYili: number
  takimEgitimSeviyesi: string
  katilimIli: string
  takimTanitimMetni: string
  resim?: string | null // Proje resmi/logosu
  sponsorYatirimlar?: {
    id: number
    yatirimMiktari: string
    status: string
    sponsor: {
      id: number
      sponsorAdi: string
    }
  }[]
  team?: {
    id: number
    name: string
    members: {
      id: number
      role: 'LEADER' | 'ADMIN' | 'MEMBER'
      status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'REMOVED'
      userId: number
      user: {
        id: number
        adsoyad: string
        email: string
        profilFoto: string | null
        userType: string
      }
    }[]
  }
  createdAt: string
  updatedAt: string
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
  teamMemberships?: any[] // Yeni sistem
  createdAt: string
  updatedAt: string
}

export default function ProjectProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Kullanıcının projeyi düzenleme yetkisi var mı kontrol et
  const hasEditPermission = (project: Project) => {
    if (!user || !project.team) return false
    
    const userMember = project.team.members.find(member => member.userId === user.id)
    return userMember && (userMember.role === 'LEADER' || userMember.role === 'ADMIN')
  }

  // Takım yönetimi sayfasını görüntüleme yetkisi (tüm aktif üyeler görebilir)
  const canViewTeamManagement = (project: Project) => {
    if (!user || !project.team) return false
    
    const userMember = project.team.members.find(member => member.userId === user.id)
    return userMember && userMember.status === 'ACTIVE'
  }

  useEffect(() => {
    if (!loading && user) {
      fetchUserData()
    }
  }, [user, loading])

  const fetchUserData = async () => {
    try {
      if (!user) return

      // Kullanıcı verilerini getir (yeni sistem ile)
      const userResponse = await fetch(`/api/user/${user.id}`)
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUserData(userData)
        
        // Kullanıcının sahip olduğu projeleri getir (userId ile eşleşenler)
        const ownProjectsResponse = await fetch(`/api/projects/projectProfileinfo?userId=${user.id}`)
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

  // Sponsor alınan ve alınmayan projeleri ayır (sadece ACCEPTED yatırımları say)
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
    if (!project.team || !user) return null
    const userMember = project.team.members.find(member => member.userId === user.id)
    return userMember ? userMember.status : null
  }

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      <Header />
      
      <main className="px-4 py-6 max-w-4xl mx-auto pb-20">
        {/* Back Button and Action Button */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Geri Dön
          </button>

          <button 
            onClick={() => router.push('/frontend/addingproject')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Proje Ekle
          </button>
        </div>

        {/* Sponsored Projects */}
        {sponsoredProjects.length > 0 && (
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Sponsor Alınan Projeler</h2>
          <div className="space-y-4">
              {sponsoredProjects.map((project) => (
              <div 
                key={project.id}
                className="flex items-center gap-4 bg-[#1A1B1E] p-4 rounded-xl hover:bg-[#3C3D41] transition-colors group"
              >
                <div 
                  className="flex-1 flex items-center gap-4 cursor-pointer"
                  onClick={() => router.push(`/frontend/projectDetail/${project.id}`)}
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
                </div>
                <div className="flex gap-2 items-center">
                  <div className="bg-green-600 px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(getProjectTotalInvestment(project))}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {hasEditPermission(project) && (
                    <button 
                      onClick={() => router.push(`/frontend/project/edit/${project.id}`)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#4C4D51] rounded-lg transition-colors"
                      title="Projeyi Düzenle"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  {canViewTeamManagement(project) && (
                    <button 
                      onClick={() => router.push(`/frontend/team/manage/${project.id}`)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#4C4D51] rounded-lg transition-colors"
                      title="Takımı Görüntüle"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                  )}
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
                className="flex items-center gap-4 bg-[#1A1B1E] p-4 rounded-xl hover:bg-[#3C3D41] transition-colors group"
              >
                <div 
                  className="flex-1 flex items-center gap-4 cursor-pointer"
                  onClick={() => router.push(`/frontend/projectDetail/${project.id}`)}
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
                <div className="flex gap-2">
                  {hasEditPermission(project) && (
                    <button 
                      onClick={() => router.push(`/frontend/project/edit/${project.id}`)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#4C4D51] rounded-lg transition-colors"
                      title="Projeyi Düzenle"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  {canViewTeamManagement(project) && (
                    <button 
                      onClick={() => router.push(`/frontend/team/manage/${project.id}`)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#4C4D51] rounded-lg transition-colors"
                      title="Takımı Görüntüle"
                    >
                      <Users className="w-5 h-5" />
                    </button>
                  )}
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
            <p className="text-gray-400 mb-4">
              Proje oluşturduğunuzda veya bir projeye katıldığınızda burada görünecekler.
            </p>
            <button 
              onClick={() => router.push('/frontend/addingproject')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              İlk Projenizi Oluşturun
            </button>
          </div>
        )}
      </main>
    </div>
  )
} 