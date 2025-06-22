"use client"

import { useState } from "react"
import { ArrowLeft, ChevronRight, Moon, Bell, Shield, HelpCircle, LogOut, User, Globe, Home, Award } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Header from "@/app/frontend/components/Header"
// import { ProfileType } from "@prisma/client"

export default function Settings() {
  const router = useRouter()
  // Varsayılan profil tipi olarak "USER" kullanıyoruz


  const settingSections = [
    {
      title: "Hesap",
      items: [
        {
          icon: <User className="w-5 h-5" />,
          title: "Profil Bilgileri",
          subtitle: "İsim, e-posta, şifre",
          path: "settingsPage/profile"
        },
      ]
    },
    /*
    {
      title: "Tercihler",
      items: [
        {
          icon: <Globe className="w-5 h-5" />,
          title: "Dil",
          subtitle: "Türkçe",
          path: "/settings/language"
        },
        {
          icon: <Moon className="w-5 h-5" />,
          title: "Görünüm",
          subtitle: "Koyu tema",
          path: "/settings/appearance"
        }
      ]
    },
    */
    {
      title: "Diğer",
      items: [
        {
          icon: <HelpCircle className="w-5 h-5" />,
          title: "Yardım ve Destek",
          subtitle: "SSS, iletişim",
          path: "settingsPage/help"
        }
      ]
    }
  ]

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

        <h1 className="text-2xl font-bold mb-6">Ayarlar</h1>
        
        <div className="space-y-6">
          {settingSections.map((section, index) => (
            <div key={index} className="bg-[#2C2D31] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-medium">{section.title}</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => router.push(item.path)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#3C3D41] transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#1A1B1E] flex items-center justify-center mr-4">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-400">{item.subtitle}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => router.push('/')}
            className="w-full mt-6 px-6 py-4 bg-[#2C2D31] rounded-xl flex items-center text-red-400 hover:bg-[#3C3D41] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#1A1B1E] flex items-center justify-center mr-4">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="font-medium">Çıkış Yap</div>
          </button>
        </div>
      </main>
    </div>
  )
} 