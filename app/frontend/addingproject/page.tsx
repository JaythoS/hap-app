"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, ChevronRight } from "lucide-react"
import Header from "@/app/frontend/components/Header"
import { useAuth } from "@/app/hooks/useAuth"

// Proje konuları listesi
const PROJECT_TOPICS = [
  "Eğitim Teknolojileri",
  "Yapay Zeka",
  "Sürdürülebilirlik",
  "Sağlık Teknolojileri",
  "Finans Teknolojileri",
  "Akıllı Şehirler",
  "Mobil Teknolojiler",
  "Siber Güvenlik",
  "Blockchain",
  "IoT (Nesnelerin İnterneti)",
];

// Eğitim seviyeleri
const EDUCATION_LEVELS = [
  "Lise",
  "Üniversite",
  "Yüksek Lisans",
  "Doktora",
  "Karma"
];

// Türkiye illeri
const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
  "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

export default function AddProjectPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newAchievement, setNewAchievement] = useState("")
  const [newDocumentUrl, setNewDocumentUrl] = useState("")

  const [formData, setFormData] = useState({
    // Step 1: Takım Bilgileri
    projectName: "",
    projectTopic: "",
    establishmentYear: "",
    educationLevel: "",
    projectSummary: "",
    participationCity: "",
    projectImage: null as File | null, // Proje resmi/logosu

    // Step 2: Proje Detayları
    problem: "",
    solution: "",
    targetAudience: "",
    impact: "",
    uniqueFeatures: "",
    videoUrl: "",
    presentationUrl: "", // Sunum linki
    documentUrls: [] as string[], // Döküman linkleri array
    achievements: [] as string[], // Proje başarıları
  })



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, projectImage: e.target.files![0] }))
    }
  }

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }))
      setNewAchievement("")
    }
  }

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }))
  }

  const addDocumentUrl = () => {
    if (newDocumentUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        documentUrls: [...prev.documentUrls, newDocumentUrl.trim()]
      }))
      setNewDocumentUrl("")
    }
  }

  const removeDocumentUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentUrls: prev.documentUrls.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep === 1) {
      setCurrentStep(2)
      return
    }

    if (!user) {
      setError('Giriş yapmanız gerekiyor')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // FormData kullanarak resim dosyasını gönder
      const formDataToSend = new FormData()
      
      // Step 1 data
      formDataToSend.append('projectName', formData.projectName)
      formDataToSend.append('projectTopic', formData.projectTopic)
      formDataToSend.append('establishmentYear', formData.establishmentYear)
      formDataToSend.append('educationLevel', formData.educationLevel)
      formDataToSend.append('projectSummary', formData.projectSummary)
      formDataToSend.append('participationCity', formData.participationCity)

      
      // Step 2 data
      formDataToSend.append('problem', formData.problem)
      formDataToSend.append('solution', formData.solution)
      formDataToSend.append('targetAudience', formData.targetAudience)
      formDataToSend.append('impact', formData.impact)
      formDataToSend.append('uniqueFeatures', formData.uniqueFeatures)
      formDataToSend.append('videoUrl', formData.videoUrl)
      formDataToSend.append('presentationUrl', formData.presentationUrl)
      formDataToSend.append('documentUrls', JSON.stringify(formData.documentUrls))
      formDataToSend.append('achievements', JSON.stringify(formData.achievements))
      
      // User info
      formDataToSend.append('userId', user.id.toString())
      
      // Location info
      formDataToSend.append('katilimIli', formData.participationCity)
      
      // Resim dosyası
      if (formData.projectImage) {
        formDataToSend.append('projectImage', formData.projectImage)
      }

      console.log('Gönderilecek proje verisi:', formDataToSend)

      const response = await fetch('/api/projects/addingproject', {
        method: 'POST',
        body: formDataToSend,
      })

      const responseData = await response.json()

      if (response.ok) {
        console.log('Proje başarıyla oluşturuldu:', responseData)
        // Başarı mesajı göster ve proje profiline yönlendir
        alert('Proje başarıyla oluşturuldu!')
        router.push('/frontend/projectProfile')
      } else {
        setError(responseData.error || 'Proje oluşturulurken hata oluştu')
      }
    } catch (error) {
      console.error('Proje oluşturma hatası:', error)
      setError('Sunucu hatası oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading ve giriş kontrolü
  if (loading) {
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
      
      <main className="px-4 py-6 max-w-3xl mx-auto pb-20">
        <button 
          onClick={() => currentStep === 1 ? router.back() : setCurrentStep(1)}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {currentStep === 1 ? 'Geri Dön' : 'Önceki Adım'}
        </button>

        <div className="bg-[#2C2D31] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Yeni Proje Ekle</h1>
            <div className="text-sm text-gray-400">
              Adım {currentStep}/2
            </div>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 ? (
              <>
                {/* Proje Adı */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Proje Adı
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Projenizin adını girin"
                    required
                  />
                </div>

                {/* Proje Konusu */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Proje Konusu
                  </label>
                  <select
                    value={formData.projectTopic}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectTopic: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Konu Seçin</option>
                    {PROJECT_TOPICS.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>



                {/* Kuruluş Yılı */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Takım Kuruluş Yılı
                  </label>
                  <input
                    type="number"
                    value={formData.establishmentYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, establishmentYear: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="YYYY"
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>

                {/* Eğitim Seviyesi */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Takım Eğitim Seviyesi
                  </label>
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, educationLevel: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Eğitim Seviyesi Seçin</option>
                    {EDUCATION_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Katılım İli */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Katılım İli
                  </label>
                  <select
                    value={formData.participationCity}
                    onChange={(e) => setFormData(prev => ({ ...prev, participationCity: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">İl Seçin</option>
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>



                {/* Proje Özeti */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Proje Özeti
                  </label>
                  <textarea
                    value={formData.projectSummary}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectSummary: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Projenizin genel özetini yazın"
                    rows={4}
                    required
                  />
                </div>

                {/* Proje Resmi/Logo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Proje Logosu/Resmi (Opsiyonel)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    {formData.projectImage && (
                      <div className="mt-2 text-sm text-gray-400">
                        Seçilen dosya: {formData.projectImage.name}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    PNG, JPG veya JPEG formatında, maksimum 5MB
                  </p>
                </div>


              </>
            ) : (
              <>
                {/* Problem */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Problem
                  </label>
                  <textarea
                    value={formData.problem}
                    onChange={(e) => setFormData(prev => ({ ...prev, problem: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Çözmeyi hedeflediğiniz problemi açıklayın"
                    rows={3}
                    required
                  />
                </div>

                {/* Çözüm */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Çözüm
                  </label>
                  <textarea
                    value={formData.solution}
                    onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Önerdiğiniz çözümü açıklayın"
                    rows={3}
                    required
                  />
                </div>

                {/* Hedef Kitle */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Hedef Kitle
                  </label>
                  <textarea
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Hedef kitlenizi tanımlayın"
                    rows={2}
                    required
                  />
                </div>

                {/* Etki */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Etki
                  </label>
                  <textarea
                    value={formData.impact}
                    onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Projenizin yaratacağı etkiyi açıklayın"
                    rows={3}
                    required
                  />
                </div>

                {/* Ayırt Edici Özellikler */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Projenin Ayırt Edici Özellikleri
                  </label>
                  <textarea
                    value={formData.uniqueFeatures}
                    onChange={(e) => setFormData(prev => ({ ...prev, uniqueFeatures: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Projenizi benzersiz kılan özellikleri açıklayın"
                    rows={3}
                    required
                  />
                </div>

                {/* Proje Tanıtım Videosu */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Proje Tanıtım Videosu URL
                  </label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Video bağlantısını girin (YouTube, Vimeo vb.)"
                  />
                </div>

                {/* Proje Başarıları */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Proje Başarıları
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        className="flex-1 bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Başarı ekleyin (örn: TÜBİTAK 2. Ödülü)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addAchievement()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addAchievement}
                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Ekle
                      </button>
                    </div>
                    
                    {formData.achievements.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Eklenen Başarılar:</p>
                        {formData.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center justify-between bg-[#1A1B1E] rounded-lg p-3 border border-gray-600">
                            <span className="text-white">{achievement}</span>
                            <button
                              type="button"
                              onClick={() => removeAchievement(index)}
                              className="text-red-400 hover:text-red-300 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sunum */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Sunum URL
                  </label>
                  <input
                    type="text"
                    value={formData.presentationUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, presentationUrl: e.target.value }))}
                    className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sunum linkini girin (Google Drive, Dropbox, OneDrive vb.)"
                  />
                  <p className="text-xs text-gray-400">
                    Google Drive, Dropbox, OneDrive veya benzeri platformlardan paylaşım linki
                  </p>
                </div>

                {/* İlgili Dökümanlar */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    İlgili Dökümanlar URL'leri
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDocumentUrl}
                        onChange={(e) => setNewDocumentUrl(e.target.value)}
                        className="flex-1 bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Döküman linkini girin (Google Drive, Dropbox vb.)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addDocumentUrl()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addDocumentUrl}
                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Ekle
                      </button>
                    </div>
                    
                    {formData.documentUrls.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Eklenen Döküman Linkleri:</p>
                        {formData.documentUrls.map((url, index) => (
                          <div key={index} className="flex items-center justify-between bg-[#1A1B1E] rounded-lg p-3 border border-gray-600">
                            <span className="text-white text-sm truncate max-w-[80%]">{url}</span>
                            <button
                              type="button"
                              onClick={() => removeDocumentUrl(index)}
                              className="text-red-400 hover:text-red-300 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Google Drive, Dropbox, OneDrive veya benzeri platformlardan paylaşım linkleri
                  </p>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    Kaydediliyor...
                    <div className="w-5 h-5 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : currentStep === 1 ? (
                  <>
                    İleri
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  'Projeyi Ekle'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 