import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH - Takım üyesinin yetkisini değiştir veya daveti kabul et
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  try {
    const { projectId, memberId } = await params
    const { role, updatedBy, action, userId } = await request.json()

    if (!projectId || !memberId) {
      return NextResponse.json({ 
        error: 'Proje ID ve üye ID gerekli' 
      }, { status: 400 })
    }

    // Eğer action 'accept_reinvite' ise, yeniden davet kabul işlemi
    if (action === 'accept_reinvite') {
      if (!userId) {
        return NextResponse.json({ 
          error: 'Kullanıcı ID gerekli' 
        }, { status: 400 })
      }

      // Takımı ve üyeyi getir
      const team = await prisma.team.findUnique({
        where: { projectId: parseInt(projectId) },
        include: {
          members: {
            where: { id: parseInt(memberId) },
            include: {
              user: {
                select: {
                  id: true,
                  adsoyad: true
                }
              }
            }
          },
          project: {
            select: {
              id: true,
              projeAdi: true
            }
          }
        }
      })

      if (!team) {
        return NextResponse.json({ error: 'Takım bulunamadı' }, { status: 404 })
      }

      const member = team.members[0]
      if (!member) {
        return NextResponse.json({ error: 'Takım üyesi bulunamadı' }, { status: 404 })
      }

      // Sadece kendi davetini kabul edebilir
      if (member.userId !== parseInt(userId)) {
        return NextResponse.json({ 
          error: 'Sadece kendi davetinizi kabul edebilirsiniz' 
        }, { status: 403 })
      }

      // Üye PENDING durumunda mı?
      if (member.status !== 'PENDING') {
        return NextResponse.json({ 
          error: 'Bekleyen bir davetiniz yok' 
        }, { status: 400 })
      }

      // Üyeyi ACTIVE durumuna getir
      const updatedMember = await prisma.teamMember.update({
        where: {
          id: parseInt(memberId)
        },
        data: {
          status: 'ACTIVE',
          joinedAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              adsoyad: true,
              email: true
            }
          }
        }
      })

      // Takım liderine bildirim gönder
      const leader = await prisma.teamMember.findFirst({
        where: {
          teamId: team.id,
          role: 'LEADER',
          status: 'ACTIVE'
        },
        include: {
          user: {
            select: {
              id: true,
              adsoyad: true
            }
          }
        }
      })

      if (leader) {
        await prisma.notification.create({
          data: {
            userId: leader.userId,
            type: 'TEAM_INVITE_ACCEPTED',
            title: 'Yeniden Davet Kabul Edildi',
            message: `${member.user.adsoyad} "${team.project.projeAdi}" projesine yeniden katılma davetini kabul etti.`,
            data: {
              teamId: team.id,
              projectId: parseInt(projectId),
              newMemberId: member.id,
              newMemberName: member.user.adsoyad,
              projectName: team.project.projeAdi,
              isReinviteAccepted: true
            }
          }
        })
      }

      return NextResponse.json({
        message: 'Davet kabul edildi! Takıma başarıyla katıldınız.',
        member: updatedMember
      })
    }

    // Normal rol değiştirme işlemi
    if (!role || !updatedBy) {
      return NextResponse.json({ 
        error: 'Rol ve güncelleyen kullanıcı ID gerekli' 
      }, { status: 400 })
    }

    // Geçerli rol kontrolü
    if (!['LEADER', 'ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json({ 
        error: 'Geçersiz rol' 
      }, { status: 400 })
    }

    // Takımı ve üyelerini getir
    const team = await prisma.team.findUnique({
      where: { projectId: parseInt(projectId) },
      include: {
        members: {
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

    // Güncelleyen kişinin yetkisi var mı kontrol et
    const updaterMember = team.members.find(m => m.userId === parseInt(updatedBy))
    if (!updaterMember || (updaterMember.role !== 'LEADER' && updaterMember.role !== 'ADMIN')) {
      return NextResponse.json({ 
        error: 'Bu işlem için yetkiniz yok' 
      }, { status: 403 })
    }

    // Güncellenecek üyeyi bul
    const targetMember = team.members.find(m => m.id === parseInt(memberId))
    if (!targetMember) {
      return NextResponse.json({ error: 'Takım üyesi bulunamadı' }, { status: 404 })
    }

    // Kendi yetkisini değiştirmeye çalışıyor mu?
    if (targetMember.userId === parseInt(updatedBy)) {
      return NextResponse.json({ 
        error: 'Kendi yetkinizi değiştiremezsiniz' 
      }, { status: 400 })
    }

    // Üye yetkisini güncelle
    const updatedMember = await prisma.teamMember.update({
      where: {
        id: parseInt(memberId)
      },
      data: {
        role: role,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            adsoyad: true,
            email: true
          }
        }
      }
    })

    // Bildirim gönder
    await prisma.notification.create({
      data: {
        userId: targetMember.userId,
        type: 'GENERAL',
        title: 'Takım Yetkiniz Güncellendi',
        message: `${updaterMember.user.adsoyad} tarafından yetkiniz "${role === 'LEADER' ? 'Lider' : role === 'ADMIN' ? 'Yönetici' : 'Üye'}" olarak güncellendi.`,
        data: {
          teamId: team.id,
          projectId: parseInt(projectId),
          newRole: role,
          updatedBy: updaterMember.user.adsoyad
        }
      }
    })

    return NextResponse.json({
      message: 'Üye yetkisi başarıyla güncellendi',
      member: updatedMember
    })

  } catch (error) {
    console.error('Update member role error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
}

// DELETE - Takımdan üye at (sadece LEADER)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  try {
    const { projectId, memberId } = await params
    const { removedBy } = await request.json()

    if (!projectId || !memberId || !removedBy) {
      return NextResponse.json({ 
        error: 'Proje ID, üye ID ve atan kullanıcı ID gerekli' 
      }, { status: 400 })
    }

    // Takımı ve üyelerini getir
    const team = await prisma.team.findUnique({
      where: { projectId: parseInt(projectId) },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                adsoyad: true
              }
            }
          }
        },
        project: {
          select: {
            id: true,
            projeAdi: true
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'Takım bulunamadı' }, { status: 404 })
    }

    // Atan kişinin LEADER yetkisi var mı kontrol et
    const removerMember = team.members.find(m => m.userId === parseInt(removedBy))
    if (!removerMember || removerMember.role !== 'LEADER') {
      return NextResponse.json({ 
        error: 'Sadece proje lideri takımdan üye atabilir' 
      }, { status: 403 })
    }

    // Atılacak üyeyi bul
    const targetMember = team.members.find(m => m.id === parseInt(memberId))
    if (!targetMember) {
      return NextResponse.json({ error: 'Takım üyesi bulunamadı' }, { status: 404 })
    }

    // Kendini atmaya çalışıyor mu?
    if (targetMember.userId === parseInt(removedBy)) {
      return NextResponse.json({ 
        error: 'Kendinizi takımdan atamazsınız' 
      }, { status: 400 })
    }

    // Üyeyi takımdan at (status'u REMOVED yap)
    const removedMember = await prisma.teamMember.update({
      where: {
        id: parseInt(memberId)
      },
      data: {
        status: 'REMOVED',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            adsoyad: true,
            email: true
          }
        }
      }
    })

    // Atılan kişiye bildirim gönder
    await prisma.notification.create({
      data: {
        userId: targetMember.userId,
        type: 'GENERAL',
        title: 'Takımdan Çıkarıldınız',
        message: `${removerMember.user.adsoyad} tarafından "${team.project.projeAdi}" projesinin takımından çıkarıldınız.`,
        data: {
          teamId: team.id,
          projectId: parseInt(projectId),
          projectName: team.project.projeAdi,
          removedBy: removerMember.user.adsoyad
        }
      }
    })

    return NextResponse.json({
      message: 'Üye başarıyla takımdan atıldı',
      member: removedMember
    })

  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
} 