"use client"

import { useState } from 'react'
import { Trash2, Edit2, Plus, AlertCircle, FolderOpenDot, Target, Code2, Eye, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'pending'
  createdAt: string
  updatedAt: string
  category: string
  imageUrl: string
}

export default function ProjectProfile() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-Ticaret Platformu',
      description: 'Modern ve kullanıcı dostu bir e-ticaret platformu geliştirme projesi.',
      status: 'active',
      createdAt: '2024-02-20',
      updatedAt: '2024-02-20',
      category: 'Web Geliştirme',
      imageUrl: '/images/icon.png'
    },
    {
      id: '2',
      name: 'Mobil Uygulama',
      description: 'Sağlık ve fitness takibi için kapsamlı bir mobil uygulama projesi.',
      status: 'pending',
      createdAt: '2024-02-15',
      updatedAt: '2024-02-18',
      category: 'Mobil Geliştirme',
      imageUrl: '/images/icon.png'
    },
    {
      id: '3',
      name: 'Yapay Zeka Asistanı',
      description: 'Doğal dil işleme tabanlı akıllı asistan geliştirme projesi.',
      status: 'completed',
      createdAt: '2024-01-10',
      updatedAt: '2024-02-10',
      category: 'Yapay Zeka',
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
            <h1 className="text-3xl font-bold text-white mb-2">Proje Yönetimi</h1>
            <p className="text-gray-400">Toplam {projects.length} proje</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              <Plus className="w-5 h-5" />
              Yeni Proje
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-[#2C2D31] rounded-lg p-6 hover:bg-[#3C3D41] transition-colors duration-200">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-48 h-32 relative rounded-lg overflow-hidden">
                  <Image
                    src={project.imageUrl}
                    alt={project.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <FolderOpenDot className="w-6 h-6 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">{project.name}</h2>
                        <span className="px-3 py-1 rounded-full text-xs bg-[#1C1C1E] text-gray-300">
                          {project.category}
                        </span>
                      </div>
                      <p className="text-gray-400">{project.description}</p>
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

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className={`px-2 py-1 rounded-full ${
                        project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {project.status === 'active' ? 'Aktif' :
                         project.status === 'completed' ? 'Tamamlandı' :
                         'Beklemede'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Oluşturulma:</span>
                      <span className="text-gray-300">{project.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Son Güncelleme:</span>
                      <span className="text-gray-300">{project.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="text-center py-12 bg-[#2C2D31] rounded-lg">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Henüz proje yok</h3>
              <p className="text-gray-400">Yeni bir proje oluşturmak için yukarıdaki butonu kullanın.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 