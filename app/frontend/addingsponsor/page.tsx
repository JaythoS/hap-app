"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Camera, Play, Globe, Mail, Phone, Building2, ImageIcon, Loader2 } from "lucide-react"
import Header from "@/app/frontend/components/Header"
import Image from "next/image"
import { useAuth } from "@/app/hooks/useAuth"

export default function AddSponsorPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    sponsorName: "",
    sponsorImage: null as File | null,
    about: "",
    videoUrl: "",
    website: "",
    email: "",
    phone: "",
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData(prev => ({ ...prev, sponsorImage: file }))
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Giriş yapmanız gerekiyor')
      return
    }

    // PROJE tipindeki kullanıcılar sponsor profili oluşturamaz
    if (user.userType === 'PROJE') {
      setError('Proje hesabı olan kullanıcılar sponsor profili oluşturamaz. Sadece proje oluşturabilirsiniz.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Fotoğraf varsa base64'e çevir
      let imageBase64 = null
      if (formData.sponsorImage) {
        try {
          const reader = new FileReader()
          imageBase64 = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result)
            reader.onerror = (e) => reject(e)
            reader.readAsDataURL(formData.sponsorImage!)
          })
          console.log('Fotoğraf base64\'e çevrildi')
        } catch (error) {
          console.error('Fotoğraf yükleme hatası:', error)
          setError('Fotoğraf yüklenirken hata oluştu')
          return
        }
      }

      const requestData = {
        sponsorName: formData.sponsorName,
        about: formData.about,
        videoUrl: formData.videoUrl,
        website: formData.website,
        email: formData.email,
        phone: formData.phone,
        userId: user.id,
        imageBase64: imageBase64 // Fotoğrafı base64 olarak gönder
      }
      
      console.log('API\'ye gönderilecek veri:', requestData)

      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const responseText = await response.text()
      console.log('API Response:', responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Response text:', responseText)
        throw new Error('API\'den geçersiz yanıt alındı. Lütfen konsolu kontrol edin.')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Sponsor bilgileri kaydedilemedi')
      }

      // Başarılı olursa sponsor profile sayfasına yönlendir
      router.push('/frontend/sponsorProfile')
      
    } catch (error: any) {
      setError(error.message || 'Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  // PROJE tipindeki kullanıcılar için erişim engeli
  if (user && user.userType === 'PROJE') {
    return (
      <div className="min-h-screen bg-[#1A1B1E] text-white">
        <Header />
        <main className="px-4 py-6 max-w-3xl mx-auto pb-20">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Geri Dön
          </button>

          <div className="bg-[#2C2D31] rounded-xl p-6 text-center">
            <Building2 className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-red-400">Erişim Engellendi</h2>
            <p className="text-gray-400 mb-4">
              Proje hesabı olan kullanıcılar sponsor profili oluşturamaz.
            </p>
            <p className="text-gray-300 mb-6">
              Sizin hesap tipiniz: <span className="text-blue-400 font-semibold">PROJE</span>
            </p>
            <button
              onClick={() => router.push('/frontend/addingproject')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Proje Oluştur
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      <Header />
      
      <main className="px-4 py-6 max-w-3xl mx-auto pb-20">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Geri Dön
        </button>

        <div className="bg-[#2C2D31] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold">Sponsor Bilgileri Ekle</h1>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sponsor Adı */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Sponsor Adı *
              </label>
              <input
                type="text"
                value={formData.sponsorName}
                onChange={(e) => setFormData(prev => ({ ...prev, sponsorName: e.target.value }))}
                className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sponsor/Şirket adını girin"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Sponsor Resmi */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Sponsor Resmi/Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-[#1A1B1E] border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Sponsor Logo"
                        fill
                        className="object-cover rounded-xl"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">Sponsor logosunu yükleyin (İsteğe bağlı)</p>
                  <p className="text-xs text-gray-400">JPG, PNG veya GIF formatında, maksimum 5MB</p>
                </div>
              </div>
            </div>

            {/* Hakkında */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Hakkında *
              </label>
              <textarea
                value={formData.about}
                onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sponsor hakkında detaylı bilgi yazın"
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Video URL (İsteğe Bağlı) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Tanıtım Videosu (İsteğe Bağlı)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://youtube.com/watch?v=..."
                  disabled={isSubmitting}
                />
                <Play className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <p className="text-xs text-gray-400">YouTube, Vimeo veya diğer video platformlarından link ekleyebilirsiniz</p>
            </div>

            {/* İletişim Bilgileri */}
            <div className="bg-[#1A1B1E] rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium text-gray-200 mb-4">İletişim Bilgileri</h3>
              
              {/* Website */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">
                  Website
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full bg-[#2C2D31] border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="www.ornek.com"
                    disabled={isSubmitting}
                  />
                  <Globe className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {/* E-posta */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">
                  E-posta
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-[#2C2D31] border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="iletisim@ornek.com"
                    disabled={isSubmitting}
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {/* Telefon */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">
                  Telefon
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#2C2D31] border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+90 (XXX) XXX XX XX"
                    disabled={isSubmitting}
                  />
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  'Sponsor Bilgilerini Kaydet'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 