"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Star, Users, Calendar, Trophy, Target, ChevronRight, Info, X, Users2} from "lucide-react"
import Header from "@/app/components/Header"
import { useState } from "react"
import useAuth from "@/app/hooks/useAuth"

// Örnek proje verisi - gerçek uygulamada bu veri API'den gelecek
const projectDetails = {
  id: 1,
  name: "EĞİTEK",
  description: "Eğitim Teknolojileri Geliştirme Projesi",
  image: "/images/icon.png",
  summary: {
    problem: "Geleneksel eğitim yöntemlerinin dijital çağın gereksinimlerini karşılayamaması",
    solution: "Yapay zeka destekli, kişiselleştirilmiş öğrenme platformu",
    target: "Öğrenciler, eğitmenler ve eğitim kurumları",
    impact: "Eğitimde erişilebilirlik ve verimliliği artırmak",
    uniquePoints: [
      "Yapay zeka tabanlı öğrenme analizi",
      "Gerçek zamanlı geri bildirim sistemi",
      "Uyarlanabilir öğrenme yolları",
      "İşbirlikçi öğrenme araçları"
    ]
  },
  video: {
    url: "https://www.youtube.com/embed/example",
    thumbnail: "/images/video-thumbnail.jpg",
    duration: "2:45",
    views: 1200
  },
  score: 30,
  trend: "up",
  rank: 1,
  teamSize: 12,
  startDate: "01.01.2024",
  targetDate: "31.12.2024",
  progress: 65,
  achievements: [
    "En İyi Eğitim Teknolojisi Ödülü",
    "Yılın İnovasyon Projesi Finalisti",
    "10.000+ Aktif Kullanıcı"
  ],
  milestones: [
    {
      title: "Proje Başlangıcı",
      date: "01.01.2024",
      completed: true
    },
    {
      title: "Alpha Sürümü",
      date: "01.03.2024",
      completed: true
    },
    {
      title: "Beta Testleri",
      date: "01.06.2024",
      completed: false
    },
    {
      title: "Resmi Lansman",
      date: "01.09.2024",
      completed: false
    }
  ],
  teamMembers: [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      role: "Proje Lideri",
      avatar: "/images/icon.png"
    },
    {
      id: 2,
      name: "Ayşe Kaya",
      role: "Yazılım Geliştirici",
      avatar: "/images/icon.png"
    },
    // ... diğer takım üyeleri
  ],
  aiAnalysis: {
    targetAudience: {
      score: 85,
      details: {
        ageRange: "18-35 yaş",
        primaryGroup: "Üniversite öğrencileri ve genç profesyoneller",
        interests: ["Teknoloji", "Eğitim", "Kişisel gelişim"],
        location: "Büyükşehirler",
        digitalBehavior: "Aktif sosyal medya kullanıcıları",
        purchasePower: "Orta-yüksek gelir grubu"
      }
    },
    originality: 85,
    marketSize: 55,
    competition: 15,
  },
  editorNote: {
    author: "Mehmet Yılmaz",
    role: "Baş Editör",
    date: "22.02.2024",
    note: "Bu proje, eğitim teknolojileri alanında yenilikçi bir yaklaşım sergiliyor. Özellikle yapay zeka kullanımı ve kişiselleştirilmiş öğrenme deneyimi sunması açısından dikkat çekici. Projenin sürdürülebilirlik planı ve pazar araştırması oldukça detaylı hazırlanmış.",
    rating: 4.5,
  },
}

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [showTargetAudienceDetails, setShowTargetAudienceDetails] = useState(false)
  const auth = useAuth()
  const profileType = auth.getProfileType()

  // Sadece giriş yapmış kullanıcılar erişebilir
  if (!auth.isLoggedIn() || !profileType) {
    console.log('Auth state:', { isLoggedIn: auth.isLoggedIn(), profileType, user: auth.getUser() })
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      <Header profileType={profileType} />
      
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
                src={projectDetails.image}
                alt={projectDetails.name}
                fill
                className="rounded-xl object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{projectDetails.name}</h1>
              <p className="text-gray-400">{projectDetails.description}</p>
            </div>
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Proje Özeti</h2>
          <div className="grid gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-400 text-sm mb-2">PROBLEM</h3>
                <p className="text-white">{projectDetails.summary.problem}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-2">ÇÖZÜM</h3>
                <p className="text-white">{projectDetails.summary.solution}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-2">HEDEF KİTLE</h3>
                <p className="text-white">{projectDetails.summary.target}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-2">ETKİ</h3>
                <p className="text-white">{projectDetails.summary.impact}</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm mb-2">AYIRT EDİCİ ÖZELLİKLER</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projectDetails.summary.uniquePoints.map((point, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 bg-[#1A1B1E] p-3 rounded-lg"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Video */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Proje Tanıtım Videosu</h2>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-[#1A1B1E]">
            <iframe
              src={projectDetails.video.url}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span>Süre: {projectDetails.video.duration}</span>
              <span>•</span>
              <span>{projectDetails.video.views.toLocaleString()} görüntülenme</span>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Proje Ekibi</h2>
          <div className="space-y-4">
            {projectDetails.teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between bg-[#1A1B1E] rounded-lg p-4">
                <div className="flex items-center">
                  <div className="relative w-10 h-10">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-400">{member.role}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-[#2C2D31] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Başarılar</h2>
          <div className="space-y-3">
            {projectDetails.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center bg-[#1A1B1E] rounded-lg p-4">
                <Trophy className="w-5 h-5 text-yellow-400 mr-3" />
                <span>{achievement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold mb-6">Yapay Zeka Analizleri</h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Hedef Kitle - Updated */}
            <div className="bg-[#1A1B1E] rounded-xl p-4">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-2">HEDEF KİTLE</span>
                <button 
                  onClick={() => setShowTargetAudienceDetails(true)}
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
                  <span className="text-2xl font-bold">{projectDetails.aiAnalysis.originality}</span>
                </div>
              </div>
            </div>

            {/* İkinci Satır */}
            <div className="bg-[#1A1B1E] rounded-xl p-4">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-2">PAZAR BÜYÜKLÜĞÜ</span>
                <div className="w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center">
                  <span className="text-2xl font-bold">{projectDetails.aiAnalysis.marketSize}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1B1E] rounded-xl p-4">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-400 mb-2">PAZARDEKİ REKABET</span>
                <div className="w-20 h-20 rounded-full border-4 border-red-400 flex items-center justify-center">
                  <span className="text-2xl font-bold">{projectDetails.aiAnalysis.competition}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor's Note */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Editör Notu</h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-5 h-5 ${
                      index < Math.floor(projectDetails.editorNote.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : index < projectDetails.editorNote.rating
                        ? 'text-yellow-400 fill-yellow-400 opacity-50'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                {projectDetails.editorNote.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="bg-[#1A1B1E] rounded-lg p-4 mb-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-400">
                    {projectDetails.editorNote.author.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <div className="font-medium">{projectDetails.editorNote.author}</div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <span>{projectDetails.editorNote.role}</span>
                  <span>•</span>
                  <span>{projectDetails.editorNote.date}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-300 mb-4">{projectDetails.editorNote.note}</p>

          </div>
        </div>
      </main>

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
                <p>{projectDetails.aiAnalysis.targetAudience.details.ageRange}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-1">Temel Grup</h4>
                <p>{projectDetails.aiAnalysis.targetAudience.details.primaryGroup}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-1">İlgi Alanları</h4>
                <div className="flex flex-wrap gap-2">
                  {projectDetails.aiAnalysis.targetAudience.details.interests.map((interest, index) => (
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
                <p>{projectDetails.aiAnalysis.targetAudience.details.location}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-1">Dijital Davranış</h4>
                <p>{projectDetails.aiAnalysis.targetAudience.details.digitalBehavior}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-1">Satın Alma Gücü</h4>
                <p>{projectDetails.aiAnalysis.targetAudience.details.purchasePower}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 