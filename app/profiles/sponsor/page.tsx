"use client"

import { useState } from 'react'
import { Trash2, Edit2, Plus, AlertCircle, Award, DollarSign, Calendar, Target, Briefcase, Eye, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Sponsorship {
  id: string
  projectName: string
  amount: number
  status: 'active' | 'completed' | 'pending'
  startDate: string
  endDate: string
  description: string
  category: string
  imageUrl: string
}

export default function SponsorProfile() {
  const router = useRouter()
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([
    {
      id: '1',
      projectName: 'Teknoloji İnovasyon Projesi',
      amount: 50000,
      status: 'active',
      startDate: '2024-02-20',
      endDate: '2024-12-31',
      description: 'Yapay zeka destekli eğitim platformu için sponsorluk desteği.',
      category: 'Teknoloji',
      imageUrl: '/images/icon.png'
    },
    {
      id: '2',
      projectName: 'Sürdürülebilir Enerji',
      amount: 75000,
      status: 'pending',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      description: 'Yenilenebilir enerji çözümleri geliştiren startup projesi.',
      category: 'Enerji',
      imageUrl: '/images/icon.png'
    },
    {
      id: '3',
      projectName: 'Sağlık Teknolojileri',
      amount: 100000,
      status: 'completed',
      startDate: '2023-09-01',
      endDate: '2024-02-01',
      description: 'Dijital sağlık platformu geliştirme projesi.',
      category: 'Sağlık',
      imageUrl: '/images/icon.png'
    }
  ])

  return (
    <div className="min-h-screen bg-[#1C1C1E] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.push('/mainPage')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Ana Sayfa</span>
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sponsorluk Yönetimi</h1>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              <Plus className="w-5 h-5" />
              Yeni Sponsorluk
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {sponsorships.map((sponsorship) => (
            <div key={sponsorship.id} className="bg-[#2C2D31] rounded-lg p-6 hover:bg-[#3C3D41] transition-colors duration-200">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-48 h-32 relative rounded-lg overflow-hidden">
                  <Image
                    src={sponsorship.imageUrl}
                    alt={sponsorship.projectName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="w-6 h-6 text-yellow-400" />
                        <h2 className="text-xl font-semibold text-white">{sponsorship.projectName}</h2>
                        <span className="px-3 py-1 rounded-full text-xs bg-[#1C1C1E] text-gray-300">
                          {sponsorship.category}
                        </span>
                      </div>
                      <p className="text-gray-400">{sponsorship.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="p-2 hover:bg-[#2C2D31] rounded-lg transition-colors group"
                        title="Önizleme"
                      >
                        <Eye className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                      </button>
                      <button 
                        className="p-2 hover:bg-[#2C2D31] rounded-lg transition-colors group"
                        title="Düzenle"
                      >
                        <Edit2 className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                      </button>
                      <button 
                        className="p-2 hover:bg-[#2C2D31] rounded-lg transition-colors group"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-3 bg-[#3C3D41] p-3 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Sponsorluk Tutarı</p>
                        <p className="font-semibold text-white">{sponsorship.amount.toLocaleString('tr-TR')} ₺</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-[#3C3D41] p-3 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Başlangıç Tarihi</p>
                        <p className="font-semibold text-white">{sponsorship.startDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[#3C3D41] p-3 rounded-lg">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Bitiş Tarihi</p>
                        <p className="font-semibold text-white">{sponsorship.endDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className={`px-2 py-1 rounded-full ${
                      sponsorship.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      sponsorship.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {sponsorship.status === 'active' ? 'Aktif' :
                       sponsorship.status === 'completed' ? 'Tamamlandı' :
                       'Beklemede'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {sponsorships.length === 0 && (
            <div className="text-center py-12 bg-[#2C2D31] rounded-lg">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Henüz sponsorluk yok</h3>
              <p className="text-gray-400">Yeni bir sponsorluk eklemek için yukarıdaki butonu kullanın.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 