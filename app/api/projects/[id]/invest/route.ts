import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    const body = await request.json()
    const { sponsorId, yatirimMiktari, mesaj } = body
    
    console.log('Investment API Request:', {
      projectId,
      sponsorId,
      yatirimMiktari,
      mesaj: mesaj ? 'Mesaj var' : 'Mesaj yok'
    })

    // Gerekli alanları kontrol et
    if (!sponsorId || !yatirimMiktari || parseFloat(yatirimMiktari) <= 0) {
      console.log('Validation failed:', { sponsorId, yatirimMiktari, mesaj: mesaj ? 'var' : 'yok' })
      return NextResponse.json(
        { error: 'Sponsor ID ve geçerli yatırım miktarı gerekli' },
        { status: 400 }
      )
    }

    // Projeyi ve takım bilgilerini bul
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: true, // Proje sahibi
        team: {
          include: {
            members: {
              where: {
                status: 'ACTIVE'
              },
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Proje bulunamadı!' },
        { status: 404 }
      )
    }

    // Sponsor'u kontrol et
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(sponsorId) },
      include: {
        user: true
      }
    })

    if (!sponsor) {
      return NextResponse.json(
        { error: 'Sponsor bulunamadı!' },
        { status: 404 }
      )
    }

    // Proje sahibi kendi projesine yatırım yapamaz
    if (project.userId === sponsor.userId) {
      return NextResponse.json(
        { error: 'Kendi projenize yatırım yapamazsınız!' },
        { status: 400 }
      )
    }

    // Yatırım kaydını oluştur (mesaj alanı geçici olarak kaldırıldı)
    const investment = await prisma.sponsorYatirim.create({
      data: {
        sponsorId: parseInt(sponsorId),
        projeId: projectId,
        yatirimMiktari: parseFloat(yatirimMiktari)
        // mesaj ve status alanları şu anda Prisma client'da yok
      }
    })

    // Proje liderine bildirim gönder
    const projectLeader = project.team?.members.find(m => m.role === 'LEADER')
    if (projectLeader) {
      await prisma.notification.create({
        data: {
          userId: projectLeader.user.id,
          // @ts-ignore
          type: 'INVESTMENT_REQUEST',
          title: 'Yeni Yatırım Talebi',
          message: `${sponsor.sponsorAdi} sponsorundan "${project.projeAdi}" projeniz için ${yatirimMiktari}₺ yatırım talebi geldi.`,
          data: {
            investmentId: investment.id,
            projectId: projectId,
            sponsorId: parseInt(sponsorId),
            amount: parseFloat(yatirimMiktari)
          }
        }
      })
    }

    // Tüm takım üyelerine de bildirim gönder (lider hariç)
    if (project.team?.members) {
      const otherMembers = project.team.members.filter(m => m.role !== 'LEADER' && m.status === 'ACTIVE')
      
      for (const member of otherMembers) {
        await prisma.notification.create({
          data: {
            userId: member.user.id,
            // @ts-ignore
            type: 'INVESTMENT_REQUEST',
            title: 'Projeye Yatırım Talebi',
            message: `${sponsor.sponsorAdi} sponsorundan "${project.projeAdi}" projeniz için ${yatirimMiktari}₺ yatırım talebi geldi.`,
            data: {
              investmentId: investment.id,
              projectId: projectId,
              sponsorId: parseInt(sponsorId),
              amount: parseFloat(yatirimMiktari)
            }
          }
        })
      }
    }

    return NextResponse.json({
      message: 'Yatırım talebi başarıyla gönderildi',
      investment
    }, { status: 201 })

  } catch (error: any) {
    console.error('Investment error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        error: 'Yatırım yapılırken hata oluştu', 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    )
  }
} 