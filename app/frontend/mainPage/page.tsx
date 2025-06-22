"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Header from "@/app/frontend/components/Header"

// Sponsor interface
interface Sponsor {
  id: number
  sponsorAdi: string
  hakkimizda: string | null
  resim: string | null
  createdAt: string
}

// Project interface
interface Project {
  id: number
  projeAdi: string
  projeKonusu: string
  takimAdi: string
  projeOzeti: string
  resim: string | null
  createdAt: string
}

// home/page.tsx içeriğinin aynısı, sadece component ismi değişti
export default function SponsorDashboard() {
  const [activeTab, setActiveTab] = useState("Gelişim Projeleri")
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const tabs = ["Gelişim Projeleri", "Sponsorlar"]

  // Verileri veritabanından çek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (activeTab === "Gelişim Projeleri") {
          const response = await fetch('/api/projects')
          if (response.ok) {
            const data = await response.json()
            // En eski proje en üstte olacak şekilde sırala
            const sortedProjects = data.sort((a: Project, b: Project) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
            setProjects(sortedProjects)
          }
        } else if (activeTab === "Sponsorlar") {
          const response = await fetch('/api/sponsors')
          if (response.ok) {
            const data = await response.json()
            // En eski sponsor en üstte olacak şekilde sırala
            const sortedSponsors = data.sort((a: Sponsor, b: Sponsor) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
            setSponsors(sortedSponsors)
          }
        }
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab])

  // Açıklama metninin ilk cümlesini çıkar
  const getFirstSentence = (text: string | null) => {
    if (!text) return "Açıklama bulunmuyor"
    
    // İlk nokta, ünlem veya soru işaretine kadar olan kısmı al
    const match = text.match(/^[^.!?]*[.!?]/)
    if (match) {
      return match[0].trim()
    }
    
    // Eğer noktalama işareti yoksa, ilk 50 karakteri al
    return text.length > 50 ? text.substring(0, 50) + "..." : text
  }

  // Açıklama metninin ilk 50 karakterini al
  const getShortDescription = (text: string) => {
    return text.length > 50 ? text.substring(0, 50) + "..." : text
  }

  // Aktif tab'a göre veriyi hazırla
  const displayData = activeTab === "Gelişim Projeleri" 
    ? projects.map((project, index) => ({
        id: project.id,
        name: project.projeAdi,
        description: getShortDescription(project.projeKonusu),
        image: project.resim || "/images/icon.png",
        rank: index + 1,
      }))
    : sponsors.map((sponsor, index) => ({
        id: sponsor.id,
        name: sponsor.sponsorAdi,
        description: getFirstSentence(sponsor.hakkimizda),
        image: sponsor.resim || "/images/icon.png",
        rank: index + 1,
      }))

  const gradients = [
    { 
      bg: 'bg-gradient-to-br from-yellow-500/20 to-orange-600/20', 
      ring: 'border-yellow-400/40',
      rankBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      shadow: 'shadow-yellow-500/20'
    },
    { 
      bg: 'bg-gradient-to-br from-gray-400/20 to-gray-600/20', 
      ring: 'border-gray-400/40',
      rankBg: 'bg-gradient-to-r from-gray-400 to-gray-600',
      shadow: 'shadow-gray-500/20'
    },
    { 
      bg: 'bg-gradient-to-br from-amber-600/20 to-yellow-800/20', 
      ring: 'border-amber-500/40',
      rankBg: 'bg-gradient-to-r from-amber-600 to-yellow-700',
      shadow: 'shadow-amber-500/20'
    },
    { 
      bg: 'bg-gradient-to-br from-blue-500/15 to-purple-600/15', 
      ring: 'border-blue-400/30',
      rankBg: 'bg-gradient-to-r from-blue-500 to-purple-600',
      shadow: 'shadow-blue-500/15'
    },
    { 
      bg: 'bg-gradient-to-br from-green-500/15 to-emerald-600/15', 
      ring: 'border-green-400/30',
      rankBg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      shadow: 'shadow-green-500/15'
    },
    { 
      bg: 'bg-gradient-to-br from-pink-500/15 to-rose-600/15', 
      ring: 'border-pink-400/30',
      rankBg: 'bg-gradient-to-r from-pink-500 to-rose-600',
      shadow: 'shadow-pink-500/15'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white px-4 py-6">
      {/* Header */}
      <Header />

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeTab === tab 
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-105" 
                : "bg-[#232327] text-gray-400 hover:bg-[#2C2D31] hover:text-white hover:scale-102"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-gray-400 text-lg">
            {activeTab === "Sponsorlar" ? "Sponsorlar yükleniyor..." : "Projeler yükleniyor..."}
          </div>
        </div>
      )}

      {/* Top Projects */}
      {!loading && (
        <div className="flex justify-center items-end gap-4 mb-8 pt-8">
          {/* 2. sırada olan proje */}
          {displayData.filter(p => p.rank === 2).map((project) => {
            const isSponsorTab = activeTab === "Sponsorlar";
            const handleTopClick = () => {
              if (isSponsorTab) {
                router.push(`/frontend/sponsorDetail/${project.id}`);
              } else {
                router.push(`/frontend/projectDetail/${project.id}`);
              } 
            };
            
            return (
              <div key={project.id} className="relative flex flex-col items-center w-32 cursor-pointer hover:scale-105 transition-all duration-300" onClick={handleTopClick}>
                <div className="relative w-24 h-24 mb-2">
                  <div className="absolute inset-0 rounded-full border-3 border-gray-400/40 shadow-lg">
                    <Image
                      src={project.image || "/images/icon.png"}
                      alt={project.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gray-500 shadow-lg">
                    {project.rank}
                  </div>
                </div>
                <div className="h-14 flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-center line-clamp-1">{project.name}</h3>
                  <p className="text-xs text-gray-400 text-center line-clamp-2">{project.description}</p>
                </div>
              </div>
            )
          })}

          {/* 1. sırada olan proje */}
          {displayData.filter(p => p.rank === 1).map((project) => {
            const isSponsorTab = activeTab === "Sponsorlar";
            const handleTopClick = () => {
              if (isSponsorTab) {
                router.push(`/frontend/sponsorDetail/${project.id}`);
              } else {
                router.push(`/frontend/projectDetail/${project.id}`);
              } 
            };
            
            return (
              <div key={project.id} className="relative flex flex-col items-center w-36 -mt-12 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleTopClick}>
                <div className="relative w-32 h-32 mb-2">
                  <div className="absolute inset-0 rounded-full border-2 border-gray-400/40">
                    <Image
                      src={project.image || "/images/icon.png"}
                      alt={project.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gray-500">
                    {project.rank}
                  </div>
                </div>
                <div className="h-14 flex flex-col items-center">
                  <h3 className="text-sm font-medium text-center line-clamp-1">{project.name}</h3>
                  <p className="text-xs text-gray-400 text-center line-clamp-2">{project.description}</p>
                </div>
              </div>
            )
          })}

          {/* 3. sırada olan proje */}
          {displayData.filter(p => p.rank === 3).map((project) => {
            const isSponsorTab = activeTab === "Sponsorlar";
            const handleTopClick = () => {
              if (isSponsorTab) {
                router.push(`/frontend/sponsorDetail/${project.id}`);
              } else {
                router.push(`/frontend/projectDetail/${project.id}`);
              } 
            };
            
            return (
              <div key={project.id} className="relative flex flex-col items-center w-32 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleTopClick}>
                <div className="relative w-24 h-24 mb-2">
                  <div className="absolute inset-0 rounded-full border-2 border-gray-400/40">
                    <Image
                      src={project.image || "/images/icon.png"}
                      alt={project.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gray-500">
                    {project.rank}
                  </div>
                </div>
                <div className="h-14 flex flex-col items-center">
                  <h3 className="text-sm font-medium text-center line-clamp-1">{project.name}</h3>
                  <p className="text-xs text-gray-400 text-center line-clamp-2">{project.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Project List with Scroll */}
      {!loading && (
        <div className="max-h-[400px] overflow-y-auto mb-8 max-w-xl mx-auto px-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="space-y-3">
            {displayData.map((project) => {
              let gradientStyle;
              // İlk 3 proje için özel renkler
              if (project.rank === 1) {
                gradientStyle = gradients[0]; // Kırmızımsı - EĞİTEK
              } else if (project.rank === 2) {
                gradientStyle = gradients[1]; // Mavimsi - GTERobotik
              } else if (project.rank === 3) {
                gradientStyle = gradients[2]; // Yeşilimsi - Hüma Tulpar
              } else {
                gradientStyle = gradients[project.id % gradients.length];
              }
              
              // Sponsorlar sekmesindeysek yönlendirme sponsorDetail'e olacak
              const isSponsorTab = activeTab === "Sponsorlar";
              const handleClick = () => {
                if (isSponsorTab) {
                  router.push(`/frontend/sponsorDetail/${project.id}`);
                } else {
                  router.push(`/frontend/projectDetail/${project.id}`);
                } 
              };
              
              return (
                <div 
                  key={project.id} 
                  className="flex items-center justify-between bg-[#1A1B1E] p-4 rounded-xl cursor-pointer hover:bg-[#2C2D31] transition-all duration-300 border border-[#3C3D41]"
                  onClick={handleClick}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                      <Image
                        src={project.image || "/images/icon.png"}
                        alt={project.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-base">{project.name}</h3>
                      <p className="text-sm text-gray-400">{project.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 
