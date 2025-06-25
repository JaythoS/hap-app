import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveProjectImageToDatabase, validateImageFile } from '@/lib/imageUpload'

// GET - Projeleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      // Belirli bir kullanıcının oluşturduğu projeleri getir
      const projects = await prisma.project.findMany({
        where: { 
          // @ts-ignore
          userId: parseInt(userId) 
        },
        include: {
          sponsorYatirimlar: {
            include: {
              sponsor: {
                select: {
                  id: true,
                  sponsorAdi: true,
                  resim: true
                }
              }
            }
          },
          form: true
        },
        orderBy: [
          { total: 'desc' }, // Total puanı yüksek olan en üstte
          { createdAt: 'desc' } // Total puanı aynı olanlar arasında yeni olanlar üstte
        ]
      })
      
      return NextResponse.json(projects)
    } else {
      // Tüm projeleri getir
      const projects = await prisma.project.findMany({
        include: {
          sponsorYatirimlar: {
            include: {
              sponsor: {
                select: {
                  id: true,
                  sponsorAdi: true,
                  resim: true
                }
              }
            }
          },
          form: true,
          // @ts-ignore
          user: {
            select: {
              id: true,
              adsoyad: true,
              profilFoto: true
            }
          }
        },
        orderBy: [
          { total: 'desc' }, // Total puanı yüksek olan en üstte
          { createdAt: 'desc' } // Total puanı aynı olanlar arasında yeni olanlar üstte
        ]
      })
      
      return NextResponse.json(projects)
    }
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
}

// POST - Yeni proje oluştur
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Form verilerini al
    const projectName = formData.get('projectName') as string
    const projectTopic = formData.get('projectTopic') as string
    const establishmentYear = formData.get('establishmentYear') as string
    const educationLevel = formData.get('educationLevel') as string
    const projectSummary = formData.get('projectSummary') as string
    const participationCity = formData.get('participationCity') as string

    
    const problem = formData.get('problem') as string
    const solution = formData.get('solution') as string
    const targetAudience = formData.get('targetAudience') as string
    const impact = formData.get('impact') as string
    const uniqueFeatures = formData.get('uniqueFeatures') as string
    const videoUrl = formData.get('videoUrl') as string
    const presentationUrl = formData.get('presentationUrl') as string
    const documentUrls = formData.get('documentUrls') as string
    const achievements = formData.get('achievements') as string
    
    const userId = formData.get('userId') as string
    const katilimIli = formData.get('katilimIli') as string
    
    // Resim dosyası
    const projectImage = formData.get('projectImage') as File | null

    // Parse achievements array
    let achievementsArray: string[] = []
    if (achievements) {
      try {
        achievementsArray = JSON.parse(achievements)
      } catch (error) {
        console.error('Achievements parse error:', error)
        achievementsArray = []
      }
    }

    // Parse document URLs array
    let documentUrlsArray: string[] = []
    if (documentUrls) {
      try {
        documentUrlsArray = JSON.parse(documentUrls)
      } catch (error) {
        console.error('Document URLs parse error:', error)
        documentUrlsArray = []
      }
    }

    console.log('Gelen veri:', {
      projectName,
      projectTopic,
      establishmentYear,
      educationLevel,
      projectSummary,
      participationCity,
      problem,
      solution,
      targetAudience,
      impact,
      uniqueFeatures,
      videoUrl,
      presentationUrl,
      documentUrls: documentUrlsArray,
      userId,
      katilimIli,
      hasImage: !!projectImage,
      achievements: achievementsArray
    })

    // UserId kontrolü
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı kimliği gerekli' }, { status: 401 })
    }

    // Kullanıcının var olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Zorunlu alanları kontrol et
    if (!projectName || !projectTopic || !establishmentYear || !educationLevel || !projectSummary) {
      return NextResponse.json({ 
        error: 'Tüm zorunlu alanlar doldurulmalıdır' 
      }, { status: 400 })
    }

    // Step 2 zorunlu alanları kontrol et
    if (!problem || !solution || !targetAudience || !impact || !uniqueFeatures) {
      return NextResponse.json({ 
        error: 'Proje detayları eksik' 
      }, { status: 400 })
    }

    // Resim yükleme işlemi
    let projectImageUrl: string | null = null
    if (projectImage && projectImage.size > 0) {
      // Resim dosyasını validate et
      if (!validateImageFile(projectImage)) {
        return NextResponse.json({ 
          error: 'Geçersiz resim dosyası. PNG, JPG veya JPEG formatında, maksimum 5MB olmalı.' 
        }, { status: 400 })
      }
      
      try {
        projectImageUrl = await saveProjectImageToDatabase(projectImage)
      } catch (error) {
        console.error('Image conversion error:', error)
        return NextResponse.json({ 
          error: 'Resim dönüştürülürken hata oluştu' 
        }, { status: 500 })
      }
    }

    // AI Analiz skorlarını rastgele oluştur (40-100 arası)
    const ozgunluk = Math.floor(Math.random() * 61) + 40 // 40-100 arası rastgele sayı
    const pazarBuyuklugu = Math.floor(Math.random() * 61) + 40
    const pazardakiRekabet = Math.floor(Math.random() * 61) + 40
    const total = Math.floor((ozgunluk + pazarBuyuklugu + pazardakiRekabet) / 3) // Ortalama

    // Yeni proje oluştur - rastgele AI skorları ile
    // @ts-ignore - Geçici Prisma client uyumsuzluğu
    const project = await prisma.project.create({
      data: {
        projeAdi: projectName.trim(),
        projeKonusu: projectTopic.trim(),
        takimAdi: projectName.trim(), // Takım adı olarak proje adını kullanıyoruz
        takimKurulusYili: parseInt(establishmentYear),
        takimEgitimSeviyesi: educationLevel.trim(),
        katilimIli: participationCity ? participationCity.trim() : katilimIli || "Belirtilmemiş",
        projeOzeti: projectSummary.trim(),
        // @ts-ignore
        presentationUrl: presentationUrl?.trim() || null,
        // @ts-ignore
        basarilar: achievementsArray,
        // AI Analiz skorları
        ozgunluk: ozgunluk,
        pazarBuyuklugu: pazarBuyuklugu,
        pazardakiRekabet: pazardakiRekabet,
        total: total,
        userId: parseInt(userId)
      }
    })
    
    // Eğer resim varsa, ayrı bir update ile resmi ekle
    let finalProject = project
    if (projectImageUrl) {
      try {
        finalProject = await prisma.project.update({
          where: { id: project.id },
          data: {
            // @ts-ignore - Resim alanı için geçici çözüm
            resim: projectImageUrl
          }
        })
      } catch (error) {
        console.log('Resim eklenmesi atlandı:', error)
        // Resim eklenmesi başarısız olsa bile devam et
      }
    }

    // Form verilerini oluştur
    const form = await prisma.form.create({
      data: {
        // @ts-ignore
        projeId: project.id,
        projeAdi: projectName.trim(),
        problem: problem.trim(),
        cozum: solution.trim(),
        hedefKitle: targetAudience.trim(),
        etki: impact.trim(),
        ayirtEdiciOzellikleri: uniqueFeatures.trim(),
        projeTanitimVideosu: videoUrl || null,
        sunum: presentationUrl?.trim() || null, // Sunum URL'i
        // @ts-ignore
        alakaliDokumanlar: documentUrlsArray, // Döküman URL'leri array
        projeEkibi: [] // Artık takım sistemi kullanıyoruz
      }
    })

    // Takım oluştur
    const team = await prisma.team.create({
      data: {
        projectId: project.id,
        name: projectName.trim(), // Takım adı proje adı ile aynı
        description: `${projectName.trim()} projesi için oluşturulan takım`
      }
    })

    // Proje sahibini takım lideri olarak ekle
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: parseInt(userId),
        role: 'LEADER',
        status: 'ACTIVE', // Proje sahibi otomatik olarak aktif
        joinedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Proje ve takım başarıyla oluşturuldu!',
      project: {
        ...finalProject,
        form,
        team: {
          ...team,
          members: [teamMember]
        }
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
} 