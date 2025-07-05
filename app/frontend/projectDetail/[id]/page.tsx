"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Star, Users, Calendar, Trophy, Target, ChevronRight, Info, X, Users2} from "lucide-react"
import Header from "@/app/frontend/components/Header"
import { useAuth } from "@/app/hooks/useAuth"
import { useState, useEffect } from "react"

interface ProjectData {
  id: number
  projeAdi: string
  projeKonusu: string
  takimAdi: string
  takimKurulusYili: number
  takimEgitimSeviyesi: string
  katilimIli: string
  projeOzeti: string
  resim?: string | null // Proje resmi/logosu
  basarilar: string[] // Proje başarıları
  sponsorYatirimlar?: any[]
  team?: {
    id: number
    name: string
    members: {
      id: number
      role: 'LEADER' | 'ADMIN' | 'MEMBER'
      status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'REMOVED'
      joinedAt: string | null
      user: {
        id: number
        adsoyad: string
        email: string
        profilFoto: string | null
        userType: string
      }
    }[]
  }
  form?: {
    id: number
    projeAdi: string
    problem: string
    cozum: string
    hedefKitle: string
    etki: string
    ayirtEdiciOzellikleri: string
    projeTanitimVideosu?: string
    projeEkibi: string[]
  }
  createdAt: string
  updatedAt: string
}

// Static data for target audience details (keeping this as it's UI-specific)
const staticTargetAudienceDetails = {
  ageRange: "18-35 yaş",
  primaryGroup: "Üniversite öğrencileri ve genç profesyoneller",
  interests: ["Teknoloji", "Eğitim", "Kişisel gelişim"],
  location: "Büyükşehirler",
  digitalBehavior: "Aktif sosyal medya kullanıcıları",
  purchasePower: "Orta-yüksek gelir grubu"
}

// AI Analysis data interface
interface AIAnalysisData {
  risk: number
  marketSize: number
  originality: number
  competition: number
}

// YouTube URL'ini embed formatına çeviren fonksiyon
const convertToEmbedUrl = (url: string): string | null => {
  if (!url) return null
  
  try {
    // YouTube URL'si kontrolü
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(youtubeRegex)
    
    if (match && match[1]) {
      const videoId = match[1]
      return `https://www.youtube.com/embed/${videoId}`
    }
    
    // Zaten embed formatındaysa direkt döndür
    if (url.includes('youtube.com/embed/')) {
      return url
    }
    
    return null
  } catch (error) {
    console.error('URL conversion error:', error)
    return null
  }
}

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user } = useAuth()
  const [showTargetAudienceDetails, setShowTargetAudienceDetails] = useState(false)
  const [showEssentialDetails, setShowEssentialDetails] = useState(false)
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [investAmount, setInvestAmount] = useState('')
  const [investDescription, setInvestDescription] = useState('')
  const [aiAnalysisData, setAiAnalysisData] = useState<AIAnalysisData | null>(null)
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false)
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null)

  const fetchAIAnalysis = async (projectId: string) => {
    setAiAnalysisLoading(true)
    setAiAnalysisError(null)
    
    try {
      const response = await fetch(`/api/projects/${projectId}/ai-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('AI analizi alınamadı')
      }
      
      const result = await response.json()
      setAiAnalysisData(result.data)
    } catch (error) {
      console.error('AI Analysis error:', error)
      setAiAnalysisError(error instanceof Error ? error.message : 'AI analizi sırasında hata oluştu')
      // Set fallback values
      setAiAnalysisData({
        risk: 65,
        marketSize: 55,
        originality: 85,
        competition: 15
      })
    } finally {
      setAiAnalysisLoading(false)
    }
  }

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/projects/${resolvedParams.id}`)
        
        if (!response.ok) {
          throw new Error('Proje bulunamadı!')
        }
        
        const data = await response.json()
        setProjectData(data)
        
        // Fetch AI analysis after project data is loaded
        await fetchAIAnalysis(resolvedParams.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu!')
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] text-white">
        <Header />
        <main className="px-4 py-6 max-w-4xl mx-auto pb-20">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Proje verisi yükleniyor...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] text-white">
        <Header />
        <main className="px-4 py-6 max-w-4xl mx-auto pb-20">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error || 'Proje bulunamadı!'}</p>
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

        {/* Project Header */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <Image
                src={projectData.resim || "/images/icon.png"}
                alt={projectData.projeAdi}
                fill
                className="rounded-xl object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{projectData.projeAdi}</h1>
              <p className="text-gray-400">{projectData.projeKonusu}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span>Kuruluş: {projectData.takimKurulusYili}</span>
                <span>•</span>
                <span>{projectData.katilimIli}</span>
              </div>
            </div>
            
            {/* Yatırım Yap Butonu - Sadece sponsor kullanıcıları için */}
            {user && user.userType === 'SPONSOR' && (
              <div className="flex-shrink-0">
                <button 
                  onClick={() => setShowInvestModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Yatırım Yap
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Proje Özeti</h2>
          <div className="space-y-6">
            <div>
              <p className="text-white leading-relaxed">{projectData.projeOzeti}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <h3 className="text-gray-400 text-sm mb-3">PROJE KONUSU</h3>
                <div className="bg-[#1A1B1E] px-3 py-1.5 rounded-full text-sm text-blue-400 inline-block">
                  {projectData.projeKonusu}
                </div>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-3">EĞİTİM SEVİYESİ</h3>
                <div className="bg-[#1A1B1E] px-3 py-1.5 rounded-full text-sm text-green-400 inline-block">
                  {projectData.takimEgitimSeviyesi}
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Project Video */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Proje Tanıtım Videosu</h2>
          {(() => {
            const videoUrl = projectData.form?.projeTanitimVideosu
            const embedUrl = convertToEmbedUrl(videoUrl || '')
            
            console.log('Original video URL:', videoUrl)
            console.log('Converted embed URL:', embedUrl)
            
            if (embedUrl) {
              return (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-[#1A1B1E]">
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Proje Tanıtım Videosu"
                  ></iframe>
                </div>
              )
            } else {
              return (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-[#1A1B1E] flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#2C2D31] flex items-center justify-center">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Video Bulunmuyor</h3>
                    <p className="text-sm">Bu proje için henüz tanıtım videosu eklenmemiş.</p>
                    {videoUrl && (
                      <div className="mt-3 text-xs text-red-400">
                        <p>Geçersiz video URL'si:</p> 
                        <p className="break-all mt-1">{videoUrl}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            }
          })()}
        </div>

        {/* Team Members - Real data */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users2 className="w-5 h-5" />
            Proje Ekibi
            {projectData.team && (
              <span className="text-sm text-gray-400">({projectData.team.members.filter(m => m.status === 'ACTIVE').length} aktif üye)</span>
            )}
          </h2>
          
          {projectData.team && projectData.team.members.length > 0 ? (
            <div className="space-y-4">
              {projectData.team.members
                .filter(member => member.status === 'ACTIVE')
                .sort((a, b) => {
                  // Rollere göre sıralama: LEADER -> ADMIN -> MEMBER
                  const roleOrder = { 'LEADER': 0, 'ADMIN': 1, 'MEMBER': 2 }
                  return roleOrder[a.role] - roleOrder[b.role]
                })
                .map((member) => (
                  <div 
                    key={member.id} 
                    onClick={() => router.push(`/frontend/user/${member.user.id}`)}
                    className="flex items-center justify-between bg-[#1A1B1E] rounded-lg p-4 hover:bg-[#3C3D41] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="relative w-12 h-12">
                        <Image
                          src={member.user.profilFoto || "/images/icon.png"}
                          alt={member.user.adsoyad}
                          fill
                          className="rounded-full object-cover border-2 border-gray-600"
                        />
                        
                        {/* Rol ikonu */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#2C2D31] flex items-center justify-center">
                          {member.role === 'LEADER' && (
                            <div className="w-3 h-3 rounded-full bg-yellow-500" title="Lider" />
                          )}
                          {member.role === 'ADMIN' && (
                            <div className="w-3 h-3 rounded-full bg-blue-500" title="Yönetici" />
                          )}
                          {member.role === 'MEMBER' && (
                            <div className="w-3 h-3 rounded-full bg-gray-500" title="Üye" />
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-3">
                        <div className="font-medium">{member.user.adsoyad}</div>
                        <div className="text-sm text-gray-400">
                          {member.role === 'LEADER' && '👑 Proje Lideri'}
                          {member.role === 'ADMIN' && '🛡️ Yönetici'}
                          {member.role === 'MEMBER' && '👤 Takım Üyesi'}
                        </div>
                        {member.joinedAt && (
                          <div className="text-xs text-gray-500">
                            {new Date(member.joinedAt).toLocaleDateString('tr-TR')} tarihinde katıldı
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-400">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Bu projede henüz takım üyesi bulunmuyor.</p>
            </div>
          )}
        </div>

        {/* Achievements - Database data */}
        {projectData.basarilar && projectData.basarilar.length > 0 && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Başarılar</h2>
            <div className="space-y-3">
              {projectData.basarilar.map((achievement: string, index: number) => (
                <div key={index} className="flex items-center bg-[#1A1B1E] rounded-lg p-4">
                  <Trophy className="w-5 h-5 text-yellow-400 mr-3" />
                  <span>{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sponsor Investments */}
        {projectData.sponsorYatirimlar && projectData.sponsorYatirimlar.length > 0 && (
          <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Sponsor Yatırımları</h2>
            <div className="space-y-3">
              {projectData.sponsorYatirimlar.map((yatirim: any, index: number) => (
                <div 
                  key={index} 
                  onClick={() => router.push(`/frontend/sponsorDetail/${yatirim.sponsor.id}`)}
                  className="flex items-center justify-between bg-[#1A1B1E] rounded-lg p-4 hover:bg-[#3C3D41] transition-colors cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="relative w-10 h-10">
                      <Image
                        src={yatirim.sponsor.resim || "/images/icon.png"}
                        alt={yatirim.sponsor.sponsorAdi}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{yatirim.sponsor.sponsorAdi}</div>
                      <div className="text-sm text-gray-400">Sponsor</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-green-400 font-bold">
                      ₺{Math.floor(parseFloat(yatirim.yatirimMiktari)).toLocaleString()}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis - Dynamic data */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-6">Yapay Zeka Analizleri</h2>
          
          {aiAnalysisError && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">
                ⚠️ AI analizi alınırken hata oluştu: {aiAnalysisError}
              </p>
              <p className="text-red-300 text-xs mt-1">
                Varsayılan değerler gösterilmektedir.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-6">
            {/* Hedef Kitle */}
            <div className="bg-[#1A1B1E] rounded-xl p-4">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-2">HEDEF KİTLE</span>
                <button 
                  onClick={() => setShowEssentialDetails(true)}
                  className="w-20 h-20 rounded-full border-4 border-green-400 flex items-center justify-center hover:bg-[#2C2D31] transition-colors"
                >
                  <Users className="w-8 h-8 text-green-400" />
                </button>
              </div>
            </div>

            <div className="bg-[#1A1B1E] rounded-xl p-4">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-2">ÖZGÜNLÜK</span>
                <div className="w-20 h-20 rounded-full border-4 border-blue-400 flex items-center justify-center">
                  {aiAnalysisLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  ) : (
                    <span className="text-2xl font-bold">{aiAnalysisData?.originality || 85}</span>
                  )}
                </div>
              </div>
            </div>

            {/* İkinci Satır */}
            <div className="bg-[#1A1B1E] rounded-xl p-4">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-2">PAZAR BÜYÜKLÜĞÜ</span>
                <div className="w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center">
                  {aiAnalysisLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  ) : (
                    <span className="text-2xl font-bold">{aiAnalysisData?.marketSize || 55}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#1A1B1E] rounded-xl p-4">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-2">PAZARDEKİ REKABET</span>
                <div className="w-20 h-20 rounded-full border-4 border-red-400 flex items-center justify-center">
                  {aiAnalysisLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
                  ) : (
                    <span className="text-2xl font-bold">{aiAnalysisData?.competition || 15}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


      </main>

      {/* Essential Project Details Popup */}
      {showEssentialDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2C2D31] rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button 
              onClick={() => setShowEssentialDetails(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold mb-6">Proje Detayları</h3>
            
            {projectData.form && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-red-300 mb-1">Problem</h4>
                  <p>{projectData.form.problem}</p>
                </div>

                <div>
                  <h4 className="text-sm text-green-300 mb-1">Çözüm</h4>
                  <p>{projectData.form.cozum}</p>
                </div>

                <div>
                  <h4 className="text-sm text-blue-300 mb-1">Hedef Kitle</h4>
                  <p>{projectData.form.hedefKitle}</p>
                </div>

                <div>
                  <h4 className="text-sm text-purple-300 mb-1">Etki</h4>
                  <p>{projectData.form.etki}</p>
                </div>

                <div>
                  <h4 className="text-sm text-yellow-300 mb-1">Ayırt Edici Özellikler</h4>
                  <p>{projectData.form.ayirtEdiciOzellikleri}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Target Audience Details Popup */}
      {showTargetAudienceDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2C2D31] rounded-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowTargetAudienceDetails(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold mb-6">Hedef Kitle Analizi</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Yaş Aralığı</h4>
                <p>{staticTargetAudienceDetails.ageRange}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-1">Temel Grup</h4>
                <p>{staticTargetAudienceDetails.primaryGroup}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-1">İlgi Alanları</h4>
                <div className="flex flex-wrap gap-2">
                  {staticTargetAudienceDetails.interests.map((interest: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-[#1A1B1E] px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-1">Lokasyon</h4>
                <p>{staticTargetAudienceDetails.location}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-1">Dijital Davranış</h4>
                <p>{staticTargetAudienceDetails.digitalBehavior}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-1">Satın Alma Gücü</h4>
                <p>{staticTargetAudienceDetails.purchasePower}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yatırım Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2C2D31] rounded-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowInvestModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold mb-6 text-orange-400">Yatırım Yap</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Yatırım Miktarı (₺)
                </label>
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={investDescription}
                  onChange={(e) => setInvestDescription(e.target.value)}
                  placeholder="Yatırımınızla ilgili bir mesaj yazın..."
                  rows={4}
                  className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowInvestModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Önce kullanıcının sponsor bilgilerini al
                      const sponsorResponse = await fetch(`/api/sponsors?userId=${user?.id}`)
                      if (!sponsorResponse.ok) {
                        alert('Sponsor bilgileriniz bulunamadı. Önce sponsor hesabı oluşturmanız gerekiyor.')
                        return
                      }
                      
                                             const sponsorData = await sponsorResponse.json()
                       console.log('Sponsor Data:', sponsorData)
                       
                       const requestData = {
                         sponsorId: sponsorData.id,
                         yatirimMiktari: investAmount,
                         mesaj: investDescription
                       }
                       console.log('Investment Request:', requestData)
                       
                       // Yatırım talebini gönder
                       const investResponse = await fetch(`/api/projects/${projectData.id}/invest`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                                                 body: JSON.stringify(requestData)
                      })

                      if (investResponse.ok) {
                        const result = await investResponse.json()
                        alert('Yatırım talebiniz başarıyla gönderildi! Proje lideri onayladığında bilgilendirileceksiniz.')
                        setShowInvestModal(false)
                        setInvestAmount('')
                        setInvestDescription('')
                                             } else {
                         const error = await investResponse.json()
                         console.error('API Error:', error)
                         alert(`Hata: ${error.error}${error.details ? ` - ${error.details}` : ''}`)
                       }
                     } catch (error) {
                       console.error('Investment error:', error)
                       alert(`Yatırım yapılırken hata oluştu: ${error}`)
                    }
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  disabled={!investAmount || parseFloat(investAmount) <= 0}
                >
                  Yatırım Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 