import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveProjectImageToDatabase, validateImageFile } from '@/lib/imageUpload'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Geçersiz proje ID!' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        projeAdi: true,
        projeKonusu: true,
        takimAdi: true,
        takimKurulusYili: true,
        takimEgitimSeviyesi: true,
        katilimIli: true,
        projeOzeti: true,
        resim: true,
        // @ts-ignore
        basarilar: true,
        createdAt: true,
        updatedAt: true,
        sponsorYatirimlar: {
          where: {
            // @ts-ignore - status field için geçici fix
            status: 'ACCEPTED'
          },
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
        team: {
          include: {
            members: {
              where: {
                status: {
                  not: 'REMOVED'
                }
              },
              include: {
                user: {
                  select: {
                    id: true,
                    adsoyad: true,
                    email: true,
                    profilFoto: true,
                    userType: true
                  }
                }
              },
              orderBy: [
                { role: 'asc' }, // LEADER önce gelsin
                { joinedAt: 'asc' }
              ]
            }
          }
        },
        form: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Proje bulunamadı!' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)

  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Geçersiz proje ID!' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    
    // Form verilerini al
    const projeAdi = formData.get('projeAdi') as string
    const projeKonusu = formData.get('projeKonusu') as string
    const takimAdi = formData.get('takimAdi') as string
    const takimKurulusYili = parseInt(formData.get('takimKurulusYili') as string)
    const takimEgitimSeviyesi = formData.get('takimEgitimSeviyesi') as string
    const projeOzeti = formData.get('projeOzeti') as string
    const katilimIli = formData.get('katilimIli') as string
    const achievements = formData.get('achievements') as string
    
    // Form alanları
    const problem = formData.get('problem') as string
    const cozum = formData.get('cozum') as string
    const hedefKitle = formData.get('hedefKitle') as string
    const etki = formData.get('etki') as string
    const ayirtEdiciOzellikleri = formData.get('ayirtEdiciOzellikleri') as string
    const projeTanitimVideosu = formData.get('projeTanitimVideosu') as string
    const presentationUrl = formData.get('presentationUrl') as string
    const documentUrls = formData.get('documentUrls') as string
    
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

    // Önce projenin var olup olmadığını kontrol et
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: { form: true }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Proje bulunamadı!' },
        { status: 404 }
      )
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

    // Proje bilgilerini güncelle - resim alanını ayrı işleyelim
    const basicUpdateData = {
      projeAdi,
      projeKonusu,
      takimAdi,
      takimKurulusYili,
      takimEgitimSeviyesi,
      katilimIli,
      // @ts-ignore
      presentationUrl: presentationUrl?.trim() || null,
      // @ts-ignore
      basarilar: achievementsArray,
    }

    let updatedProject
    
    // Önce temel bilgileri güncelle
    updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: basicUpdateData
    })
    
    // Eğer resim varsa, ayrı bir update ile resmi güncelle
    if (projectImageUrl) {
      try {
        updatedProject = await prisma.project.update({
          where: { id: projectId },
          data: {
            // @ts-ignore - Resim alanı için geçici çözüm
            resim: projectImageUrl
          }
        })
      } catch (error) {
        console.log('Resim güncellemesi atlandı:', error)
        // Resim güncellemesi başarısız olsa bile devam et
      }
    }

    // Form bilgilerini güncelle veya oluştur
    if (problem || cozum || hedefKitle || etki || ayirtEdiciOzellikleri) {
      if (existingProject.form) {
        // Form varsa güncelle
        await prisma.form.update({
          where: { projeId: projectId },
          data: {
            projeAdi,
            problem: problem || existingProject.form.problem,
            cozum: cozum || existingProject.form.cozum,
            hedefKitle: hedefKitle || existingProject.form.hedefKitle,
            etki: etki || existingProject.form.etki,
            ayirtEdiciOzellikleri: ayirtEdiciOzellikleri || existingProject.form.ayirtEdiciOzellikleri,
            projeTanitimVideosu: projeTanitimVideosu || null,
            sunum: presentationUrl?.trim() || null,
            // @ts-ignore
            alakaliDokumanlar: documentUrlsArray,
            projeEkibi: [],
          }
        })
      } else {
        // Form yoksa oluştur
        await prisma.form.create({
          data: {
            projeId: projectId,
            projeAdi,
            problem: problem || "",
            cozum: cozum || "",
            hedefKitle: hedefKitle || "",
            etki: etki || "",
            ayirtEdiciOzellikleri: ayirtEdiciOzellikleri || "",
            projeTanitimVideosu: projeTanitimVideosu || null,
            sunum: presentationUrl?.trim() || null,
            // @ts-ignore
            alakaliDokumanlar: documentUrlsArray,
            projeEkibi: [],
          }
        })
      }
    }

    // Güncellenmiş projeyi form ile birlikte getir
    const finalProject = await prisma.project.findUnique({
      where: { id: projectId },
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
        team: {
          include: {
            members: {
              where: {
                status: 'ACTIVE'
              },
              include: {
                user: {
                  select: {
                    id: true,
                    adsoyad: true,
                    email: true,
                    profilFoto: true,
                    userType: true
                  }
                }
              },
              orderBy: [
                { role: 'asc' }, // LEADER önce gelsin
                { joinedAt: 'asc' }
              ]
            }
          }
        },
        form: true
      }
    })

    return NextResponse.json(finalProject)

  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
} 