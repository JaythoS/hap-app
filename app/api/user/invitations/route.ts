import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Kullanıcının aldığı takım davetlerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 })
    }

    // Kullanıcının aldığı bekleyen davetleri getir
    const invitations = await prisma.teamInvitation.findMany({
      where: {
        inviteeId: parseInt(userId),
        status: 'PENDING'
      },
      include: {
        team: {
          include: {
            project: {
              select: {
                id: true,
                projeAdi: true,
                projeKonusu: true,
                projeOzeti: true,
                resim: true,
                katilimIli: true,
                takimKurulusYili: true,
                takimEgitimSeviyesi: true
              }
            }
          }
        },
        inviter: {
          select: {
            id: true,
            adsoyad: true,
            profilFoto: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Süresi dolmuş davetleri filtrele
    const activeInvitations = invitations.filter(invitation => {
      if (!invitation.expiresAt) return true
      return new Date() <= invitation.expiresAt
    })

    return NextResponse.json({
      invitations: activeInvitations,
      total: activeInvitations.length
    })

  } catch (error) {
    console.error('Get user invitations error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
} 