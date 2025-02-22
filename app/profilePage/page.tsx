"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Mail, User, Calendar, Award, Star, Activity, Edit, Camera } from "lucide-react"
import Header from "@/app/components/Header"
import useAuth from "@/app/hooks/useAuth"

// Varsayılan istatistikler ve aktiviteler
const defaultStats = {
  projectCount: 0,
  completedProjects: 0,
  totalScore: 0,
  achievements: 0
}

const defaultActivities = [
  {
    id: 1,
    type: "project",
    action: "Henüz aktivite yok",
    date: "şimdi"
  }
]

export default function ProfilePage() {
  const router = useRouter()
  const auth = useAuth()
  const profileType = auth.getProfileType()
  const user = auth.getUser()
  const fullName = auth.getFullName()
  
  // Auth check
  if (!auth.isLoggedIn() || !profileType || !user) {
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

        {/* Profile Header */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="relative w-24 h-24">
                <Image
                  src="/images/icon.png"
                  alt={fullName || ''}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-[#1A1B1E] rounded-full">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{fullName}</h1>
                </div>
                <button className="p-2 bg-[#1A1B1E] rounded-full">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">Katılım: {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long'
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#2C2D31] rounded-xl p-4">
            <div className="flex items-center text-blue-400 mb-2">
              <Activity className="w-4 h-4 mr-2" />
              <span className="text-sm">Projeler</span>
            </div>
            <span className="text-xl font-bold">{defaultStats.projectCount}</span>
          </div>
          <div className="bg-[#2C2D31] rounded-xl p-4">
            <div className="flex items-center text-green-400 mb-2">
              <Award className="w-4 h-4 mr-2" />
              <span className="text-sm">Tamamlanan</span>
            </div>
            <span className="text-xl font-bold">{defaultStats.completedProjects}</span>
          </div>
          <div className="bg-[#2C2D31] rounded-xl p-4">
            <div className="flex items-center text-yellow-400 mb-2">
              <Star className="w-4 h-4 mr-2" />
              <span className="text-sm">Puan</span>
            </div>
            <span className="text-xl font-bold">{defaultStats.totalScore}</span>
          </div>
          <div className="bg-[#2C2D31] rounded-xl p-4">
            <div className="flex items-center text-purple-400 mb-2">
              <Award className="w-4 h-4 mr-2" />
              <span className="text-sm">Başarılar</span>
            </div>
            <span className="text-xl font-bold">{defaultStats.achievements}</span>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-[#2C2D31] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Son Aktiviteler</h2>
          <div className="space-y-4">
            {defaultActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between bg-[#1A1B1E] p-4 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {activity.type === "project" ? (
                    <Activity className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Award className="w-5 h-5 text-yellow-400" />
                  )}
                  <span>{activity.action}</span>
                </div>
                <span className="text-sm text-gray-400">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
} 