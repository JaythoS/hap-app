"use client"

import { useState, useEffect, type ReactElement } from "react"
import { ArrowLeft, Camera, Plus, X, Twitter, Instagram, Facebook, Linkedin, Github, Youtube, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import Header from "@/app/frontend/components/Header"
import { useAuth } from "@/app/hooks/useAuth"
import Image from "next/image"

type SocialMedia = {
  id: string;
  platform: string;
  link: string;
}

type SocialPlatform = {
  value: string;
  label: string;
  icon: ReactElement;
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
  createdAt: string
  updatedAt: string
}

export default function ProfileEdit() {
  const router = useRouter()
  const { user, loading, refreshUser } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    website: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    instagram: "",
    linkedin: "",
    github: ""
  })

  const socialPlatforms: SocialPlatform[] = [
    { value: "twitter", label: "Twitter", icon: <Twitter className="w-5 h-5" /> },
    { value: "instagram", label: "Instagram", icon: <Instagram className="w-5 h-5" /> },
    { value: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-5 h-5" /> },
    { value: "github", label: "GitHub", icon: <Github className="w-5 h-5" /> },
  ]

  useEffect(() => {
    if (!loading && user) {
      fetchUserData()
    }
  }, [user, loading])

  const fetchUserData = async () => {
    try {
      if (!user) return

      const response = await fetch(`/api/user/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        
        // Form verilerini doldur
        setFormData({
          name: data.adsoyad || "",
          email: data.email || "",
          bio: data.hakkimda || "",
          website: data.website || "",
        })

        setSocialLinks({
          twitter: data.twitter || "",
          instagram: data.instagram || "",
          linkedin: data.linkedin || "",
          github: data.github || ""
        })
      }
    } catch (error) {
      console.error('Kullanıcı verileri yüklenemedi:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalıdır.')
      return
    }

    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setProfilePhoto(result)
      setPhotoPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const triggerPhotoUpload = () => {
    const input = document.getElementById('photo-upload') as HTMLInputElement
    input?.click()
  }

  const removePhoto = () => {
    setProfilePhoto("") // Boş string gönder, null yerine
    setPhotoPreview(null)
    // Input'u temizle
    const input = document.getElementById('photo-upload') as HTMLInputElement
    if (input) input.value = ''
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setUpdating(true)
    try {
      const updateData = {
        adsoyad: formData.name.trim(),
        hakkimda: formData.bio.trim() || null,
        website: formData.website.trim() || null,
        twitter: socialLinks.twitter.trim() || null,
        instagram: socialLinks.instagram.trim() || null,
        linkedin: socialLinks.linkedin.trim() || null,
        github: socialLinks.github.trim() || null,
        profilFoto: profilePhoto === "" ? null : (profilePhoto || userData?.profilFoto || null),
      }

      const response = await fetch(`/api/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Profil güncellendi:', result)
        
        // Auth context'teki user bilgilerini güncelle
        await refreshUser()
        
        alert("Profil bilgileri başarıyla güncellendi!")
        router.push('/frontend/settingsPage/profile')
      } else {
        const error = await response.json()
        alert(`Hata: ${error.error || 'Profil güncellenemedi'}`)
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Yeni şifreler eşleşmiyor!")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("Yeni şifre en az 6 karakter olmalıdır!")
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        alert("Şifre başarıyla güncellendi!")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const error = await response.json()
        alert(`Hata: ${error.error || 'Şifre güncellenemedi'}`)
      }
    } catch (error) {
      console.error('Şifre güncelleme hatası:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setUpdating(false)
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

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      <Header />
      
      <main className="px-4 py-6 max-w-4xl mx-auto pb-20">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Geri Dön
        </button>

        <h1 className="text-2xl font-bold mb-6">Profil Düzenle</h1>

        {/* Profil Bilgileri Bölümü */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#1A1B1E] overflow-hidden">
                  <Image
                    src={photoPreview || userData?.profilFoto || "/images/icon.png"}
                    alt="Profil fotoğrafı"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={triggerPhotoUpload}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={triggerPhotoUpload}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Fotoğraf Seç
                </button>
                {(photoPreview || userData?.profilFoto) && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Fotoğrafı Kaldır
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                JPG, PNG veya GIF formatında, maksimum 5MB
              </p>
              
              {/* Hidden file input */}
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-[#1A1B1E] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                E-posta
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 bg-[#1A1B1E] rounded-lg border border-gray-700 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-400 mb-2">
                Website
              </label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="example.com veya https://example.com"
                className="w-full px-4 py-2 bg-[#1A1B1E] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Website adresi opsiyoneldir. google.com gibi basit format da kabul edilir.</p>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-2">
                Hakkımda
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Kendinizden bahsedin..."
                className="w-full px-4 py-2 bg-[#1A1B1E] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Sosyal Medya Bölümü */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium mb-4">Sosyal Medya Hesapları</h3>
              
              <div className="space-y-3">
                {socialPlatforms.map((platform) => (
                  <div
                    key={platform.value}
                    className="flex items-center justify-between bg-[#1A1B1E] p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-[140px]">
                      {platform.icon}
                      <span className="font-medium">{platform.label}</span>
                    </div>
                    <input
                      type="text"
                      value={socialLinks[platform.value as keyof typeof socialLinks]}
                      onChange={(e) => handleSocialLinkChange(platform.value, e.target.value)}
                      placeholder="Profil linki ekle"
                      className="flex-1 px-4 py-2 bg-[#2C2D31] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>

        {/* Şifre Değiştirme Bölümü */}
        <div className="bg-[#2C2D31] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Şifre Değiştir</h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-400 mb-2">
                Mevcut Şifre
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 bg-[#1A1B1E] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-400 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 bg-[#1A1B1E] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">En az 6 karakter olmalıdır</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-2">
                Yeni Şifre Tekrar
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-2 bg-[#1A1B1E] rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Güncelleniyor...' : 'Şifreyi Değiştir'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 