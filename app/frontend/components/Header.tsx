"use client"

import { User, Bell, Settings, LogOut, X, Handshake, FolderOpenDot } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../hooks/useAuth"
import Image from "next/image"

// Zaman hesaplama fonksiyonu
const getTimeAgo = (date: string) => {
  const now = new Date()
  const notificationDate = new Date(date)
  const diffInMs = now.getTime() - notificationDate.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return "Şimdi"
  if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`
  if (diffInHours < 24) return `${diffInHours} saat önce`
  if (diffInDays < 7) return `${diffInDays} gün önce`
  return notificationDate.toLocaleDateString('tr-TR')
}

export default function Header() {
  const router = useRouter()
  const { user, logout, loading } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Bildirimleri API'den çek
  const fetchNotifications = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/notification?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Bildirimler yüklenemedi:', error)
    }
  }



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

  // Kullanıcı bilgisi geldiğinde bildirimleri çek
  useEffect(() => {
    if (user && !loading) {
      fetchNotifications()
    }
  }, [user, loading])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notification/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id })
      })
      
      if (response.ok) {
        setNotifications(notifications.filter(notification => notification.id !== id))
      } else {
        console.error('Bildirim silinemedi:', await response.text())
      }
    } catch (error) {
      console.error('Bildirim silinemedi:', error)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notification/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user?.id,
          isRead: true 
        })
      })
      
      if (response.ok) {
        setNotifications(notifications.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        ))
      } else {
        console.error('Bildirim güncellenemedi:', await response.text())
      }
    } catch (error) {
      console.error('Bildirim güncellenemedi:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/notification', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      })
      
      if (response.ok) {
        setNotifications(notifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date()
        })))
      }
    } catch (error) {
      console.error('Bildirimler güncellenemedi:', error)
    }
  }

  const handleTeamInviteResponse = async (invitationId: number, action: 'accept' | 'reject', notificationId: number) => {
    if (!user) return

    try {
      const response = await fetch(`/api/team/invitation/${invitationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userId: user.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert(result.message)
        // Bildirimi sil
        await deleteNotification(notificationId)
        
        // Eğer kabul edildiyse sayfayı yenile
        if (action === 'accept') {
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      } else {
        alert(result.error || 'İşlem başarısız')
      }
    } catch (error) {
      console.error('Davet yanıtlama hatası:', error)
      alert('Sunucu hatası oluştu')
    }
  }

  // Yeniden davet kabul etme
  const handleReinviteResponse = async (projectId: number, memberId: number, action: 'accept' | 'reject', notificationId: number) => {
    if (!user) return

    try {
      if (action === 'accept') {
        // Yeniden daveti kabul et
        const response = await fetch(`/api/team/${projectId}/member/${memberId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'accept_reinvite',
            userId: user.id
          })
        })

        const result = await response.json()

        if (response.ok) {
          alert('Davet kabul edildi! Takıma başarıyla katıldınız.')
          // Bildirimi sil
          await deleteNotification(notificationId)
          // Sayfayı yenile
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          alert(result.error || 'İşlem başarısız')
        }
      } else {
        // Yeniden daveti reddet - sadece bildirimi sil, member kaydı REMOVED kalır
        alert('Davet reddedildi.')
        await deleteNotification(notificationId)
      }
    } catch (error) {
      console.error('Yeniden davet yanıtlama hatası:', error)
      alert('Sunucu hatası oluştu')
    }
  }

  // Yatırım talebi yanıtlama
  const handleInvestmentResponse = async (action: 'approve' | 'reject', notificationId: number) => {
    try {
      const response = await fetch(`/api/notification/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        
        // Bildirimleri yeniden yükle
        await fetchNotifications()
      } else {
        const error = await response.json()
        alert(`Hata: ${error.error}`)
      }
    } catch (error) {
      console.error('Yatırım yanıtlama hatası:', error)
      alert('Sunucu hatası oluştu')
    }
  }

  const getMenuItems = () => {
    if (!user) return []

    // Temel profil öğesi - kullanıcı tipine göre yönlendirme
    const profileItem = {
      label: "Profil",
      icon: User,
      onClick: () => {
        let profilePath = '/frontend/profilePage/normal' // Varsayılan normal kullanıcı
        
        if (user.userType === "SPONSOR") {
          profilePath = '/frontend/profilePage/sponsor'
        } else if (user.userType === "PROJE") {
          profilePath = '/frontend/profilePage/proje'
        }
        
        router.push(profilePath)
      },
    }

    // Kullanıcı tipine özel profil öğesi
    const typeSpecificItem = (() => {
      switch (user.userType) {
        case "SPONSOR":
          return {
            label: "Sponsor Hesabı",
            icon: Handshake,
            onClick: () => router.push('/frontend/sponsorProfile'),
          }
        case "PROJE":
          return {
            label: "Proje Profili",
            icon: FolderOpenDot,
            onClick: () => router.push('/frontend/projectProfile'),
          }
        default:
          return null
      }
    })()

    // Ayarlar öğesi
    const settingsItem = {
      label: "Ayarlar",
      icon: Settings,
      onClick: () => router.push('/frontend/settingsPage'),
    }

    // Menü öğelerini birleştir
    const menuItems = [profileItem]
    if (typeSpecificItem) menuItems.push(typeSpecificItem)
    menuItems.push(settingsItem)

    return menuItems
  }

  // Kullanıcı yükleniyor
  if (loading) {
    return (
      <div className="flex justify-end items-center mb-8 gap-3 p-4">
        <div className="animate-pulse flex gap-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
          <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  // Kullanıcı giriş yapmamış
  if (!user) {
    return null
  }

  return (
    <div className="flex justify-between items-center mb-8 gap-3 p-4">
      {/* Sol boşluk - responsive layout için */}
      <div className="w-20"></div>
      
      {/* HAP Logo - Ortada */}
      <div className="flex-1 flex justify-center">
        <button 
          onClick={() => router.push('/frontend/mainPage')}
          className="hover:opacity-80 transition-opacity group"
        >
          <div className="relative w-12 h-12 group-hover:scale-105 transition-transform">
            <Image
              src="/images/icon.png"
              alt="HAP Logo"
              fill
              className="object-contain rounded-lg"
              priority
            />
          </div>
        </button>
      </div>

      {/* Sağ menüler */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={menuRef}>
        <button 
          className="relative p-2 bg-[#2C2D31] rounded-full"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <User className="w-6 h-6" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
        </button>
        
        {/* User Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#2C2D31] shadow-lg py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-700">
              <div className="font-medium text-sm">{user.adsoyad}</div>
              <div className="text-xs text-blue-400 mt-1">
                {user.userType === "NORMAL" && "Normal Hesap"}
                {user.userType === "PROJE" && "Proje Hesabı"}
                {user.userType === "SPONSOR" && "Sponsor Hesabı"}
              </div>
            </div>
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
                        <span className="text-xs text-gray-400">{getTimeAgo(notification.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                      
                      {/* Yeniden davet için özel butonlar */}
                      {notification.data?.isReinvite ? (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const projectId = notification.data.projectId
                              const memberId = notification.data.memberId
                              handleReinviteResponse(projectId, memberId, 'accept', notification.id)
                            }}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Kabul Et
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const projectId = notification.data.projectId
                              const memberId = notification.data.memberId
                              handleReinviteResponse(projectId, memberId, 'reject', notification.id)
                            }}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Reddet
                          </button>
                        </div>
                      ) : notification.type === 'INVESTMENT_REQUEST' && notification.data ? (
                        /* Yatırım talebi için özel butonlar */
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInvestmentResponse('approve', notification.id)
                            }}
                            className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                          >
                            Yatırımı Onayla
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInvestmentResponse('reject', notification.id)
                            }}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Reddet
                          </button>
                        </div>
                      ) : (
                        /* Takım daveti için özel butonlar */
                        notification.type === 'TEAM_INVITE' && notification.data && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTeamInviteResponse(notification.data.invitationId, 'accept', notification.id)
                              }}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Kabul Et
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTeamInviteResponse(notification.data.invitationId, 'reject', notification.id)
                              }}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Reddet
                            </button>
                          </div>
                        )
                      )}
                      
                      {/* Okundu butonu - sadece okunmamış bildirimler için */}
                      {!notification.isRead && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Okundu İşaretle
                          </button>
                        </div>
                      )}
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
    </div>
  )
} 