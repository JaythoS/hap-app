import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Projeye ait takım bilgilerini getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    
    if (!projectId) {
      return NextResponse.json({ error: 'Proje ID gerekli' }, { status: 400 })
    }

    // Takım bilgilerini ve üyelerini getir
    const team = await prisma.team.findUnique({
      where: {
        projectId: parseInt(projectId)
      },
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
            takimEgitimSeviyesi: true,
            createdAt: true
          }
        },
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
        },
        invitations: {
          where: {
            status: 'PENDING'
          },
          include: {
            inviter: {
              select: {
                id: true,
                adsoyad: true
              }
            },
            invitee: {
              select: {
                id: true,
                adsoyad: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'Takım bulunamadı' }, { status: 404 })
    }

    // Takım istatistikleri
    const stats = {
      totalMembers: team.members.length,
      activeMembers: team.members.filter(m => m.status === 'ACTIVE').length,
      pendingMembers: team.members.filter(m => m.status === 'PENDING').length,
      pendingInvitations: team.invitations.length,
      leaders: team.members.filter(m => m.role === 'LEADER').length,
      admins: team.members.filter(m => m.role === 'ADMIN').length,
      regularMembers: team.members.filter(m => m.role === 'MEMBER').length
    }

    return NextResponse.json({
      team,
      stats
    })

  } catch (error) {
    console.error('Get team error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
}

// POST - Takıma üye davet et
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const { email, message, inviterId } = await request.json()

    if (!projectId || !email || !inviterId) {
      return NextResponse.json({ 
        error: 'Proje ID, email ve davet eden kullanıcı ID gerekli' 
      }, { status: 400 })
    }

    // Takımı bul
    const team = await prisma.team.findUnique({
      where: { projectId: parseInt(projectId) },
      include: {
        members: {
          where: {
            userId: parseInt(inviterId)
          },
          include: {
            user: {
              select: {
                id: true,
                adsoyad: true
              }
            }
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'Takım bulunamadı' }, { status: 404 })
    }

    // Davet eden kişinin yetkisi var mı kontrol et
    const inviterMember = team.members[0]
    if (!inviterMember || (inviterMember.role !== 'LEADER' && inviterMember.role !== 'ADMIN')) {
      return NextResponse.json({ 
        error: 'Bu işlem için yetkiniz yok' 
      }, { status: 403 })
    }

    // Email ile kullanıcıyı bul
    const inviteeUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Kullanıcı yoksa hata ver
    if (!inviteeUser) {
      return NextResponse.json({ 
        error: 'Bu email adresine kayıtlı kullanıcı bulunamadı' 
      }, { status: 404 })
    }

    // Kullanıcının userType'ı PROJE değilse hata ver
    if (inviteeUser.userType !== 'PROJE') {
      return NextResponse.json({ 
        error: 'Sadece proje hesabına sahip kullanıcılar takıma davet edilebilir' 
      }, { status: 400 })
    }

    // Zaten takımda mı kontrol et
    if (inviteeUser) {
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: inviteeUser.id
          }
        }
      })

      if (existingMember) {
        // Eğer üye REMOVED durumundaysa, tekrar davet edilebilir
        if (existingMember.status === 'REMOVED') {
          // REMOVED üyeyi PENDING durumuna getir
          await prisma.teamMember.update({
            where: {
              id: existingMember.id
            },
            data: {
              status: 'PENDING',
              role: 'MEMBER', // Varsayılan rol
              updatedAt: new Date()
            }
          })

          // Bildirim gönder
          await prisma.notification.create({
            data: {
              userId: inviteeUser.id,
              type: 'TEAM_INVITE',
              title: 'Takıma Yeniden Davet Edildiniz',
              message: `${inviterMember.user.adsoyad} sizi "${team.name}" takımına yeniden davet etti.`,
              data: {
                teamId: team.id,
                projectId: parseInt(projectId),
                memberId: existingMember.id,
                inviterName: inviterMember.user.adsoyad,
                teamName: team.name,
                isReinvite: true
              }
            }
          })

          return NextResponse.json({
            message: 'Kullanıcı başarıyla yeniden davet edildi',
            isReinvite: true
          }, { status: 200 })
        } else {
          // ACTIVE veya PENDING durumundaysa hata ver
          return NextResponse.json({ 
            error: existingMember.status === 'ACTIVE' 
              ? 'Bu kullanıcı zaten takımda aktif' 
              : 'Bu kullanıcının bekleyen bir daveti var'
          }, { status: 400 })
        }
      }
    }

    // Mevcut davet var mı kontrol et
    const existingInvitation = await prisma.teamInvitation.findUnique({
      where: {
        teamId_inviteeEmail: {
          teamId: team.id,
          inviteeEmail: email.toLowerCase()
        }
      }
    })

    let invitation

    if (existingInvitation) {
      if (existingInvitation.status === 'PENDING') {
        return NextResponse.json({ 
          error: 'Bu email adresine zaten bekleyen bir davet gönderilmiş' 
        }, { status: 400 })
      }
      
      // Eğer davet REJECTED veya ACCEPTED ise, yeni davet olarak güncelle
      invitation = await prisma.teamInvitation.update({
        where: {
          id: existingInvitation.id
        },
        data: {
          inviterId: parseInt(inviterId),
          message: message || null,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
          createdAt: new Date(), // Yeni davet tarihi
          updatedAt: new Date()
        },
        include: {
          inviter: {
            select: {
              id: true,
              adsoyad: true
            }
          },
          invitee: {
            select: {
              id: true,
              adsoyad: true,
              email: true
            }
          }
        }
      })
    } else {
      // Hiç davet yoksa yeni davet oluştur
      invitation = await prisma.teamInvitation.create({
        data: {
          teamId: team.id,
          inviterId: parseInt(inviterId),
          inviteeId: inviteeUser.id,
          inviteeEmail: email.toLowerCase(),
          message: message || null,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 gün sonra
        },
        include: {
          inviter: {
            select: {
              id: true,
              adsoyad: true
            }
          },
          invitee: {
            select: {
              id: true,
              adsoyad: true,
              email: true
            }
          }
        }
      })
    }

    // Bildirim gönder (inviteeUser garantili var)
    await prisma.notification.create({
      data: {
        userId: inviteeUser.id,
        type: 'TEAM_INVITE',
        title: 'Takım Daveti',
        message: `${inviterMember.user.adsoyad} sizi "${team.name}" takımına davet etti.`,
        data: {
          teamId: team.id,
          projectId: parseInt(projectId),
          invitationId: invitation.id,
          inviterName: inviterMember.user.adsoyad,
          teamName: team.name
        }
      }
    })

    return NextResponse.json({
      message: 'Davet başarıyla gönderildi',
      invitation
    }, { status: 201 })

  } catch (error) {
    console.error('Send invitation error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
} 