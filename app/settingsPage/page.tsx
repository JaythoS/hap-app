"use client"

import { useState } from "react"
import { ChevronRight, Moon, Bell, Shield, HelpCircle, LogOut, User, Globe, Home, Award } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Header from "@/app/components/Header"
import useAuth from "@/app/hooks/useAuth"


export default function Settings() {
  const router = useRouter()
  const auth = useAuth()
  const profileType = auth.getProfileType()

  // Auth check
  if (!auth.isLoggedIn() || !profileType) {
    router.push('/login')
    return null
  }

  const settingSections = [
    {
      title: "Hesap",
      items: [
        {
          icon: <User className="w-5 h-5" />,
          title: "Profil Bilgileri",
          subtitle: "İsim, e-posta, şifre",
          path: "/settings/profile"
        },
        {
          icon: <Bell className="w-5 h-5" />,
          title: "Bildirimler",
          subtitle: "Bildirim tercihleri",
          path: "/settings/notifications"
        }
      ]
    },
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
    {
      title: "Diğer",
      items: [
        {
          icon: <Shield className="w-5 h-5" />,
          title: "Gizlilik ve Güvenlik",
          subtitle: "Güvenlik ayarları",
          path: "/settings/privacy"
        },
        {
          icon: <HelpCircle className="w-5 h-5" />,
          title: "Yardım ve Destek",
          subtitle: "SSS, iletişim",
          path: "/settings/help"
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white px-4 py-6 pb-20">
      {/* Header */}
      <Header profileType={profileType} />

      {/* Profile Preview */}
      <div className="flex items-center gap-4 bg-[#2C2D31] p-4 rounded-xl mb-6 mt-4">
        <div className="relative w-16 h-16">
          <Image
            src="/images/icon.png"
            alt="Profile"
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-medium text-lg">Kullanıcı Adı</h2>
          <p className="text-sm text-gray-400">kullanici@email.com</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-medium text-gray-400 mb-2 px-2">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item) => (
                <button
                  key={item.title}
                  onClick={() => router.push(item.path)}
                  className="w-full flex items-center justify-between bg-[#2C2D31] p-4 rounded-xl hover:bg-[#3C3D41] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400">
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
      </div>

      {/* Logout Button */}
      <button 
        className="w-full flex items-center gap-3 bg-[#2C2D31] p-4 rounded-xl mt-6 text-red-400 hover:bg-[#3C3D41] transition-colors"
        onClick={() => router.push('/logout')}
      >
        <LogOut className="w-5 h-5" />
        <span>Çıkış Yap</span>
      </button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#2C2D31] p-4">
        <div className="flex justify-around max-w-md mx-auto">
          <button className="p-2" onClick={() => router.push('/home')}>
            <Home className="w-6 h-6 text-gray-400" />
          </button>
          <button className="p-2" onClick={() => router.push('/klasor2')}>
            <Award className="w-6 h-6 text-gray-400" />
          </button>
          <button className="p-2" onClick={() => router.push('/klasor3')}>
            <User className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
} 