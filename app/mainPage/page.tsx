"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Header from "@/app/components/Header"
import useAuth from "@/app/hooks/useAuth"


// home/page.tsx içeriğinin aynısı, sadece component ismi değişti
export default function SponsorDashboard() {
  const [activeTab, setActiveTab] = useState("Gelişim Projeleri")
  const router = useRouter()
  const auth = useAuth()
  const profileType = auth.getProfileType()

  // Auth check
  if (!auth.isLoggedIn() || !profileType) {
    router.push('/login')
    return null
  }

  const tabs = ["Gelişim Projeleri", "Sponsorlar"]

  const allProjects = {
    "Gelişim Projeleri": [
      {
        id: 1,
        name: "EĞİTEK",
        description: "Eğitim Teknolojileri",
        score: 30,
        trend: "up",
        image: "/images/icon.png",
        rank: 1,
      },
      {
        id: 2,
        name: "GTERobotik",
        description: "Sanayide Dijital Teknolojiler",
        score: 21,
        trend: "up",
        image: "/images/icon.png",
        rank: 2,
      },
      {
        id: 3,
        name: "Hüma Tulpar",
        description: "Uçan Araba Simülasyon",
        score: 2,
        trend: "down",
        image: "/images/icon.png",
        rank: 3,
      },
    ],
    "Sponsorlar": [
      {
        id: 4,
        name: "TechPro",
        description: "Teknoloji Sponsoru",
        score: 45,
        trend: "up",
        image: "/images/icon.png",
        rank: 1,
      },
      {
        id: 5,
        name: "InnovaCorp",
        description: "AR/VR Teknolojileri",
        score: 38,
        trend: "up",
        image: "/images/icon.png",
        rank: 2,
      },
      {
        id: 6,
        name: "FutureX",
        description: "Yapay Zeka Çözümleri",
        score: 25,
        trend: "down",
        image: "/images/icon.png",
        rank: 3,
      },
    ],
  }

  const projects = allProjects[activeTab as keyof typeof allProjects]

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white px-4 py-6">
      {/* Header */}
      <Header profileType={profileType} />

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              activeTab === tab 
                ? "bg-[#2C2D31] text-white" 
                : "bg-[#232327] text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top Projects */}
      <div className="flex justify-center items-end gap-4 mb-8 pt-8">
        {/* 2. sırada olan proje */}
        {projects.filter(p => p.rank === 2).map((project) => (
          <div key={project.id} className="relative flex flex-col items-center w-32">
            <div className="relative w-24 h-24 mb-2">
              <div className={`absolute inset-0 rounded-full border-2 ${
                project.trend === "up" ? "border-green-400" : "border-red-400"
              }`}>
                <Image
                  src={project.image || "/images/icon.png"}
                  alt={project.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                project.trend === "up" ? "bg-green-400" : "bg-red-400"
              }`}>
                {project.rank}
              </div>
            </div>
            <div className="h-14 flex flex-col items-center">
              <h3 className="text-sm font-medium text-center line-clamp-1">{project.name}</h3>
              <p className="text-xs text-gray-400 text-center line-clamp-2">{project.description}</p>
            </div>
          </div>
        ))}

        {/* 1. sırada olan proje */}
        {projects.filter(p => p.rank === 1).map((project) => (
          <div key={project.id} className="relative flex flex-col items-center w-36 -mt-12">
            <div className="relative w-32 h-32 mb-2">
              <div className={`absolute inset-0 rounded-full border-2 ${
                project.trend === "up" ? "border-green-400" : "border-red-400"
              }`}>
                <Image
                  src={project.image || "/images/icon.png"}
                  alt={project.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                project.trend === "up" ? "bg-green-400" : "bg-red-400"
              }`}>
                {project.rank}
              </div>
            </div>
            <div className="h-14 flex flex-col items-center">
              <h3 className="text-sm font-medium text-center line-clamp-1">{project.name}</h3>
              <p className="text-xs text-gray-400 text-center line-clamp-2">{project.description}</p>
            </div>
          </div>
        ))}

        {/* 3. sırada olan proje */}
        {projects.filter(p => p.rank === 3).map((project) => (
          <div key={project.id} className="relative flex flex-col items-center w-32">
            <div className="relative w-24 h-24 mb-2">
              <div className={`absolute inset-0 rounded-full border-2 ${
                project.trend === "up" ? "border-green-400" : "border-red-400"
              }`}>
                <Image
                  src={project.image || "/images/icon.png"}
                  alt={project.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                project.trend === "up" ? "bg-green-400" : "bg-red-400"
              }`}>
                {project.rank}
              </div>
            </div>
            <div className="h-14 flex flex-col items-center">
              <h3 className="text-sm font-medium text-center line-clamp-1">{project.name}</h3>
              <p className="text-xs text-gray-400 text-center line-clamp-2">{project.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Project List */}
      <div className="space-y-3 mb-8 max-w-xl mx-auto px-1">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="flex items-center justify-between bg-[#2C2D31] p-4 rounded-xl cursor-pointer hover:bg-[#3C3D41] transition-colors"
            onClick={() => router.push(`/project/${project.id}`)}
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
            <div className="flex items-center gap-2">
              {project.trend === "up" ? <div className="text-green-400">▲</div> : <div className="text-red-400">▼</div>}
              <span className="font-medium">{project.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
