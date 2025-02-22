"use client"

import { Home, Award, Star, User, Bell, Settings, LogOut, X, Handshake, FolderOpenDot } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { ProfileType } from "@prisma/client"
import useAuth from "@/app/hooks/useAuth"

interface HeaderProps {
  profileType: ProfileType
}

export default function Header({ profileType }: HeaderProps) {
  const router = useRouter()
  const auth = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Yeni Eğitim Eklendi",
      message: "Girişimcilik 101 eğitimi yayına alındı",
      time: "5 dakika önce",
      isRead: false,
    },
    {
      id: 2,
      title: "Başarı Rozeti",
      message: "İlk eğitimini tamamladın!",
      time: "2 saat önce",
      isRead: false,
    },
    {
      id: 3,
      title: "Hatırlatma",
      message: "Yarın başlayacak canlı yayını kaçırma",
      time: "1 gün önce",
      isRead: true,
    },
  ])
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    auth.logout()
    router.push('/')
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isRead: true
    })))
  }

  const getMenuItems = () => {
    // Temel profil öğesi
    const profileItem = {
      label: "Profil",
      icon: User,
      onClick: () => router.push('/profilePage'),
    }

    // Kullanıcı tipine özel profil öğesi
    const typeSpecificItem = (() => {
      switch (profileType) {
        case "SPONSOR":
          return {
            label: "Sponsor Profili",
            icon: Handshake,
            onClick: () => router.push('/profiles/sponsor'),
          }
        case "PROJECT":
          return {
            label: "Proje Profili",
            icon: FolderOpenDot,
            onClick: () => router.push('/profiles/project'),
          }
        default:
          return null
      }
    })()

    // Ayarlar öğesi
    const settingsItem = {
      label: "Ayarlar",
      icon: Settings,
      onClick: () => router.push('/settings'),
    }

    // Menü öğelerini birleştir
    const menuItems = [profileItem]
    if (typeSpecificItem) menuItems.push(typeSpecificItem)
    menuItems.push(settingsItem)

    return menuItems
  }

  // Kullanıcı bilgilerini al
  const user = auth.getUser()
  const fullName = auth.getFullName()

  return (
    <div className="flex justify-end items-center mb-8 gap-3 p-4">
      <div className="relative" ref={menuRef}>
        <button 
          className="relative p-2 bg-[#2C2D31] rounded-full"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <User className="w-6 h-6" />
          {user && (
            <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
          )}
        </button>
        
        {/* User Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#2C2D31] shadow-lg py-1 z-50">
            {user && (
              <div className="px-4 py-2 border-b border-gray-700">
                <div className="font-medium text-sm">{fullName}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
            )}
            {getMenuItems().map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="flex items-center px-4 py-2 text-sm text-white hover:bg-[#3C3D41] w-full"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-700 my-1"></div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-[#3C3D41] w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="relative" ref={notificationRef}>
        <button 
          className="relative p-2 bg-[#2C2D31] rounded-full"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {notifications.filter(n => !n.isRead).length}
          </span>
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 rounded-lg bg-[#2C2D31] shadow-lg py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-medium">Bildirimler</h3>
              {notifications.some(n => !n.isRead) && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-[#3C3D41] cursor-pointer group ${
                      !notification.isRead ? 'bg-[#3C3D41]/50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          <span className="text-xs text-gray-400">{notification.time}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  Bildirim bulunmamaktadır.
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-700">
                <button className="text-sm text-blue-400 hover:text-blue-300 w-full text-center">
                  Tümünü Gör
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 