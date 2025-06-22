import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Daveti kabul et veya reddet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const { invitationId } = await params
    const { action, userId } = await request.json() // action: 'accept' | 'reject'

    if (!invitationId || !action || !userId) {
      return NextResponse.json({ 
        error: 'Davet ID, aksiyon ve kullanıcı ID gerekli' 
      }, { status: 400 })
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Geçersiz aksiyon. "accept" veya "reject" olmalı' 
      }, { status: 400 })
    }

    // Daveti bul
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: parseInt(invitationId) },
      include: {
        team: {
          include: {
            project: {
              select: {
                id: true,
                projeAdi: true
              }
            }
          }
        },
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

    if (!invitation) {
      return NextResponse.json({ error: 'Davet bulunamadı' }, { status: 404 })
    }

    // Davet süresi dolmuş mu kontrol et
    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      return NextResponse.json({ 
        error: 'Bu davet süresi dolmuş' 
      }, { status: 400 })
    }

    // Sadece davet edilen kişi daveti kabul/red edebilir
    if (invitation.inviteeId !== parseInt(userId)) {
      return NextResponse.json({ 
        error: 'Bu daveti sadece davet edilen kişi yanıtlayabilir' 
      }, { status: 403 })
    }

    // Davet zaten yanıtlanmış mı kontrol et
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Bu davet zaten yanıtlanmış' 
      }, { status: 400 })
    }

    if (action === 'accept') {
      // Kullanıcı zaten takımda mı kontrol et
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: invitation.teamId,
            userId: parseInt(userId)
          }
        }
      })

      if (existingMember) {
        return NextResponse.json({ 
          error: 'Zaten bu takımın üyesisiniz' 
        }, { status: 400 })
      }

      // Transaction ile davet kabul et ve takıma ekle
      const result = await prisma.$transaction(async (tx) => {
        // Daveti kabul edildi olarak güncelle
        const updatedInvitation = await tx.teamInvitation.update({
          where: { id: parseInt(invitationId) },
          data: { status: 'ACTIVE' } // TeamMemberStatus enum'unda ACCEPTED yok, ACTIVE kullanıyoruz
        })

        // Kullanıcıyı takıma ekle
        const newMember = await tx.teamMember.create({
          data: {
            teamId: invitation.teamId,
            userId: parseInt(userId),
            role: 'MEMBER',
            status: 'ACTIVE',
            joinedAt: new Date()
          },
          include: {
            user: {
              select: {
                id: true,
                adsoyad: true,
                email: true,
                profilFoto: true
              }
            }
          }
        })

        // Davet eden kişiye bildirim gönder
        await tx.notification.create({
          data: {
            userId: invitation.inviterId,
            type: 'TEAM_INVITE_ACCEPTED',
            title: 'Takım Daveti Kabul Edildi',
            message: `${invitation.invitee?.adsoyad} "${invitation.team.project.projeAdi}" projesine katılma davetinizi kabul etti.`,
            data: {
              teamId: invitation.teamId,
              projectId: invitation.team.projectId,
              newMemberId: newMember.id,
              newMemberName: invitation.invitee?.adsoyad,
              projectName: invitation.team.project.projeAdi
            }
          }
        })

        return { updatedInvitation, newMember }
      })

      return NextResponse.json({
        message: 'Davet kabul edildi! Takıma başarıyla katıldınız.',
        invitation: result.updatedInvitation,
        member: result.newMember
      })

    } else { // action === 'reject'
      // Daveti reddet
      const updatedInvitation = await prisma.teamInvitation.update({
        where: { id: parseInt(invitationId) },
        data: { status: 'REJECTED' }
      })

      // Davet eden kişiye bildirim gönder
      await prisma.notification.create({
        data: {
          userId: invitation.inviterId,
          type: 'TEAM_INVITE_REJECTED',
          title: 'Takım Daveti Reddedildi',
          message: `${invitation.invitee?.adsoyad} "${invitation.team.project.projeAdi}" projesine katılma davetinizi reddetti.`,
          data: {
            teamId: invitation.teamId,
            projectId: invitation.team.projectId,
            rejectedByName: invitation.invitee?.adsoyad,
            projectName: invitation.team.project.projeAdi
          }
        }
      })

      return NextResponse.json({
        message: 'Davet reddedildi.',
        invitation: updatedInvitation
      })
    }

  } catch (error) {
    console.error('Invitation response error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
}

// DELETE - Daveti iptal et (sadece davet eden kişi)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const { invitationId } = await params
    const { userId } = await request.json()

    if (!invitationId || !userId) {
      return NextResponse.json({ 
        error: 'Davet ID ve kullanıcı ID gerekli' 
      }, { status: 400 })
    }

    // Daveti bul
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: parseInt(invitationId) },
      include: {
        team: {
          include: {
            project: {
              select: {
                projeAdi: true
              }
            }
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Davet bulunamadı' }, { status: 404 })
    }

    // Sadece davet eden kişi daveti iptal edebilir
    if (invitation.inviterId !== parseInt(userId)) {
      return NextResponse.json({ 
        error: 'Bu daveti sadece gönderen kişi iptal edebilir' 
      }, { status: 403 })
    }

    // Daveti sil
    await prisma.teamInvitation.delete({
      where: { id: parseInt(invitationId) }
    })

    return NextResponse.json({
      message: 'Davet başarıyla iptal edildi'
    })

  } catch (error) {
    console.error('Cancel invitation error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
} 