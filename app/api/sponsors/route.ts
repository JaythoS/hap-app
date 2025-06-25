import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Sponsor bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sponsorId = searchParams.get('id')
    const userId = searchParams.get('userId')
    
    if (sponsorId) {
      // Belirli bir sponsor'u getir
      const sponsor = await prisma.sponsor.findUnique({
        where: { id: parseInt(sponsorId) },
        include: {
          // @ts-ignore
          user: {
            select: {
              id: true,
              adsoyad: true,
              email: true,
              profilFoto: true,
              hakkimda: true,
              website: true,
              twitter: true,
              linkedin: true,
              instagram: true,
              github: true,
              userType: true,
              sponsors: {
                select: {
                  id: true,
                  sponsorAdi: true,
                  resim: true,
                  hakkimizda: true,
                  website: true,
                  email: true,
                  telefon: true
                }
              }
            }
          }, // Sponsor'u oluşturan kullanıcı bilgilerini detaylı getir
          yatirimlar: {
            include: {
              proje: true
            }
          }
        }
      })
      
      if (!sponsor) {
        return NextResponse.json({ error: 'Sponsor bulunamadı' }, { status: 404 })
      }
      
      return NextResponse.json(sponsor)
    } else if (userId) {
      // Belirli bir kullanıcının sponsor bilgilerini getir
      const userSponsor = await prisma.sponsor.findFirst({
        where: { 
          // @ts-ignore
          userId: parseInt(userId) 
        },
        include: {
          // @ts-ignore
          user: true,
          yatirimlar: {
            include: {
              proje: true
            }
          }
        }
      })
      
      if (!userSponsor) {
        return NextResponse.json({ error: 'Bu kullanıcıya ait sponsor bilgisi bulunamadı' }, { status: 404 })
      }
      
      return NextResponse.json(userSponsor)
    } else {
      // Tüm sponsor'ları getir - toplam yatırım miktarına göre sırala
      const sponsors = await prisma.sponsor.findMany({
        include: {
          // @ts-ignore
          user: true, // Sponsor'u oluşturan kullanıcı bilgilerini de getir
          yatirimlar: {
            where: {
              // @ts-ignore
              status: 'ACCEPTED' // Sadece onaylanmış yatırımları say
            },
            include: {
              proje: true
            }
          }
        }
      })

      // JavaScript'te toplam yatırım miktarına göre sırala
      const sortedSponsors = sponsors.sort((a, b) => {
        const totalA = a.yatirimlar.reduce((sum, yatirim) => sum + parseFloat(yatirim.yatirimMiktari.toString()), 0)
        const totalB = b.yatirimlar.reduce((sum, yatirim) => sum + parseFloat(yatirim.yatirimMiktari.toString()), 0)
        return totalB - totalA // En çok yatırım yapan en üstte
      })
      
      return NextResponse.json(sortedSponsors)
    }
  } catch (error) {
    console.error('Sponsor bilgileri alınırken hata:', error)
    return NextResponse.json({ error: 'Sponsor bilgileri alınamadı' }, { status: 500 })
  }
}

// POST - Yeni sponsor bilgisi oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sponsorName, about, videoUrl, website, email, phone, userId, imageBase64 } = body

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

    // PROJE tipindeki kullanıcılar sponsor profili oluşturamaz
    if (user.userType === 'PROJE') {
      return NextResponse.json({ 
        error: 'Proje hesabı olan kullanıcılar sponsor profili oluşturamaz. Sadece proje oluşturabilirsiniz.' 
      }, { status: 403 })
    }

    // SPONSOR ve NORMAL tipi kullanıcılar sponsor profili oluşturabilir

    // Sadece zorunlu alanları kontrol et
    if (!sponsorName || !about) {
      return NextResponse.json({ 
        error: 'Sponsor adı ve hakkında alanları zorunludur' 
      }, { status: 400 })
    }

    // Email girilmişse ve boş değilse benzersizlik kontrolü yap
    if (email && email.trim() !== '') {
      const existingSponsor = await prisma.sponsor.findUnique({
        where: { email }
      })

      if (existingSponsor) {
        return NextResponse.json({ 
          error: 'Bu email adresi ile kayıtlı sponsor zaten mevcut' 
        }, { status: 400 })
      }
    }

    // Yeni sponsor oluştur
    const newSponsor = await prisma.sponsor.create({
      data: {
        // @ts-ignore
        userId: parseInt(userId), // Hangi kullanıcının oluşturduğunu kaydet
        sponsorAdi: sponsorName,
        hakkimizda: about,
        video: videoUrl || null,
        email: email || user.email, // Email boşsa user email'ini kullan
        telefon: phone || null,
        website: website || null,
        resim: imageBase64 || null // Base64 formatında resmi kaydet
      }
    })

    return NextResponse.json({ 
      message: 'Sponsor bilgileri başarıyla kaydedildi',
      sponsor: newSponsor 
    }, { status: 201 })

  } catch (error: any) {
    console.error('Sponsor oluşturulurken hata:', error)
    console.error('Hata detayı:', error.message)
    console.error('Stack trace:', error.stack)
    return NextResponse.json({ 
      error: 'Sponsor oluşturulamadı', 
      details: error.message,
      code: error.code 
    }, { status: 500 })
  }
} 