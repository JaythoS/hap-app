"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, ArrowLeft, Home } from "lucide-react"
import Header from "@/app/frontend/components/Header"
import { useAuth } from "@/app/hooks/useAuth"

export default function UnauthorizedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  
  const reason = searchParams.get('reason') || 'Bu sayfaya erişim yetkiniz bulunmamaktadır.'

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'NORMAL':
                  return 'Normal Hesap'
      case 'PROJE':
        return 'Proje Hesabı'
              case 'SPONSOR':
          return 'Sponsor Hesabı'
      default:
        return 'Bilinmeyen'
    }
  }

  const getSuggestions = (userType: string) => {
    switch (userType) {
      case 'NORMAL':
        return [
          'Ana sayfada projeleri inceleyebilirsiniz',
          'Sponsor profillerini görüntüleyebilirsiniz',
          'Profil ayarlarınızı güncelleyebilirsiniz'
        ]
      case 'PROJE':
        return [
          'Proje ekleme sayfasına gidebilirsiniz',
          'Proje profilinizi düzenleyebilirsiniz',
          'Mevcut projelerinizi yönetebilirsiniz'
        ]
      case 'SPONSOR':
        return [
          'Sponsor hesabı oluşturabilirsiniz',
          'Sponsor hesabınızı düzenleyebilirsiniz',
          'Projelere yatırım yapabilirsiniz'
        ]
      default:
        return []
    }
  }

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

        {/* Error Content */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#2C2D31] rounded-xl p-8 mb-6">
            <AlertTriangle className="w-20 h-20 mx-auto text-red-400 mb-6" />
            
            <h1 className="text-3xl font-bold mb-4 text-red-400">
              Erişim Reddedildi
            </h1>
            
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              {reason}
            </p>

            {user && (
              <div className="bg-[#1A1B1E] rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">Mevcut hesap tipiniz:</p>
                <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                  {getUserTypeLabel(user.userType)}
                </span>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {user && getSuggestions(user.userType).length > 0 && (
            <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Ne yapabilirsiniz?</h2>
              <ul className="space-y-2 text-left">
                {getSuggestions(user.userType).map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push('/frontend/mainPage')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Ana Sayfaya Dön
            </button>
            
            {!user && (
              <button
                onClick={() => router.push('/frontend/registerPage')}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Giriş Yap
              </button>
            )}
            
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Geri Dön
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-sm text-gray-400">
            <p>
              Eğer bu bir hata olduğunu düşünüyorsanız, lütfen destek ekibi ile iletişime geçin.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 