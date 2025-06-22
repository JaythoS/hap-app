"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Minus } from "lucide-react"
import { useRouter } from "next/navigation"
import Header from "@/app/frontend/components/Header"
// import { ProfileType } from "@prisma/client"

interface FAQItem {
  question: string
  answer: string
}

export default function HelpAndSupport() {
  const router = useRouter()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const profileType: string = "USER"

  const faqItems: FAQItem[] = [
    {
      question: "Hap-App nedir?",
      answer: "Hap-App, ilaç takibinizi kolaylaştıran, hatırlatmalar sunan ve sağlık rutininizi düzenlemenize yardımcı olan bir dijital sağlık asistanıdır."
    },
    {
      question: "İlaç hatırlatmalarını nasıl ayarlayabilirim?",
      answer: "Ana sayfadaki 'Yeni İlaç Ekle' butonuna tıklayarak ilaçlarınızı ekleyebilir, kullanım zamanlarını ve dozlarını belirleyebilirsiniz. Sistem otomatik olarak size hatırlatma yapacaktır."
    },
    {
      question: "Birden fazla kişi için ilaç takibi yapabilir miyim?",
      answer: "Evet, aile üyeleri veya bakımını üstlendiğiniz kişiler için profiller oluşturabilir ve her biri için ayrı ilaç takibi yapabilirsiniz."
    },
    {
      question: "Verilerim güvende mi?",
      answer: "Evet, tüm sağlık verileriniz şifrelenerek saklanmakta ve en yüksek güvenlik standartlarıyla korunmaktadır. Verileriniz sadece sizin izin verdiğiniz kişilerle paylaşılır."
    }
  ]

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

        <h1 className="text-2xl font-bold mb-8">Yardım ve Destek</h1>

        {/* Uygulama Hakkında */}
        <section className="bg-[#2C2D31] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Uygulama Hakkında</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Hap-App, ilaç kullanımınızı düzenli ve güvenli bir şekilde takip etmenizi sağlayan bir dijital sağlık asistanıdır. 
            Amacımız, kullanıcılarımızın ilaç tedavilerini aksatmadan sürdürmelerini ve sağlık rutinlerini kolayca yönetmelerini sağlamaktır.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Uygulamamız, ilaç hatırlatmaları, dozaj takibi, stok yönetimi ve sağlık raporları gibi özelliklerle hayatınızı kolaylaştırır.
          </p>
        </section>

        {/* Kullanım Kılavuzu */}
        <section className="bg-[#2C2D31] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Kullanım Kılavuzu</h2>
          <div className="space-y-4">
            <div className="bg-[#1A1B1E] p-4 rounded-lg">
              <h3 className="font-medium mb-2">1. İlaç Ekleme</h3>
              <p className="text-gray-300">Ana sayfadaki "+" butonunu kullanarak yeni ilaç ekleyebilirsiniz. İlacın adı, dozu, kullanım sıklığı ve süresi gibi bilgileri girmeniz gerekir.</p>
            </div>
            <div className="bg-[#1A1B1E] p-4 rounded-lg">
              <h3 className="font-medium mb-2">2. Hatırlatmalar</h3>
              <p className="text-gray-300">İlaç ekleme sırasında belirlediğiniz zamanlarda bildirimler alacaksınız. Bildirimleri açık tutmayı unutmayın.</p>
            </div>
            <div className="bg-[#1A1B1E] p-4 rounded-lg">
              <h3 className="font-medium mb-2">3. İlaç Takibi</h3>
              <p className="text-gray-300">Takvim görünümünden geçmiş kullanımlarınızı kontrol edebilir, gelecek dozları planlayabilirsiniz.</p>
            </div>
          </div>
        </section>

        {/* SSS */}
        <section className="bg-[#2C2D31] rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Sık Sorulan Sorular</h2>
          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-700 last:border-0">
                <button
                  className="w-full py-4 flex items-center justify-between hover:text-gray-300"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span className="font-medium text-left">{item.question}</span>
                  {openFAQ === index ? (
                    <Minus className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="pb-4 text-gray-300">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
} 