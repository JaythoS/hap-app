import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Yatırım talebini onaylama/reddetme
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const notificationId = parseInt(id)

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Geçersiz bildirim ID!' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action } = body // 'approve' veya 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Geçerli bir aksiyon gerekli (approve/reject)' },
        { status: 400 }
      )
    }

    // Notification'ı bul
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Bildirim bulunamadı!' },
        { status: 404 }
      )
    }

    // @ts-ignore
    if (notification.type !== 'INVESTMENT_REQUEST') {
      return NextResponse.json(
        { error: 'Bu bildirim bir yatırım talebi değil!' },
        { status: 400 }
      )
    }

    // Notification data'sından investment bilgilerini al
    const notificationData = notification.data as any
    const investmentId = notificationData?.investmentId

    if (!investmentId) {
      return NextResponse.json(
        { error: 'Yatırım bilgisi bulunamadı!' },
        { status: 400 }
      )
    }

    // Yatırım kaydını bul
    const investment = await prisma.sponsorYatirim.findUnique({
      where: { id: investmentId },
      include: {
        sponsor: {
          include: {
            user: true
          }
        },
        proje: true
      }
    })

    if (!investment) {
      return NextResponse.json(
        { error: 'Yatırım kaydı bulunamadı!' },
        { status: 404 }
      )
    }

    // Yatırım status'unu güncelle
    const newStatus = action === 'approve' ? 'ACCEPTED' : 'REJECTED'
    
    await prisma.sponsorYatirim.update({
      where: { id: investmentId },
      data: {
        // @ts-ignore - status field için geçici fix
        status: newStatus
      }
    })

    // Bildirimi sil (onaylandı/reddedildi, artık gerekli değil)
    await prisma.notification.delete({
      where: { id: notificationId }
    })

    // Sponsor'a sonuç bildirimini gönder
    const resultTitle = action === 'approve' 
      ? 'Yatırım Talebiniz Onaylandı!' 
      : 'Yatırım Talebiniz Reddedildi'
    
    const resultMessage = action === 'approve'
      ? `"${investment.proje.projeAdi}" projesine yaptığınız ${investment.yatirimMiktari}₺ yatırım talebi onaylandı!`
      : `"${investment.proje.projeAdi}" projesine yaptığınız ${investment.yatirimMiktari}₺ yatırım talebi reddedildi.`

    await prisma.notification.create({
      data: {
        userId: investment.sponsor.user.id,
        // @ts-ignore
        type: action === 'approve' ? 'INVESTMENT_ACCEPTED' : 'INVESTMENT_REJECTED',
        title: resultTitle,
        message: resultMessage,
        data: {
          investmentId: investment.id,
          projectId: investment.proje.id,
          amount: investment.yatirimMiktari.toString()
        }
      }
    })

    return NextResponse.json({
      message: `Yatırım talebi ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`,
      investment: {
        id: investment.id,
        status: newStatus,
        amount: investment.yatirimMiktari
      }
    })

  } catch (error: any) {
    console.error('Investment action error:', error)
    return NextResponse.json(
      { 
        error: 'İşlem gerçekleştirilemedi',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - Notification detayını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const notificationId = parseInt(id)

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Geçersiz bildirim ID!' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Bildirim bulunamadı!' },
        { status: 404 }
      )
    }

    return NextResponse.json(notification)

  } catch (error) {
    console.error('Get notification error:', error)
    return NextResponse.json(
      { error: 'Bildirim getirilemedi' },
      { status: 500 }
    )
  }
}

// DELETE - Bildirimi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = parseInt(params.id)
    const body = await request.json()
    const { userId } = body

    // Bildirim var mı kontrol et
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Bildirim bulunamadı' },
        { status: 404 }
      )
    }

    // Kullanıcı yetkisi kontrolü
    if (userId && notification.userId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Bu bildirimi silme yetkiniz yok' },
        { status: 403 }
      )
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { error: 'Bildirim silinemedi' },
      { status: 500 }
    )
  }
}

// PATCH - Bildirimi güncelle (okundu işaretle)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = parseInt(params.id)
    const body = await request.json()
    const { isRead, userId } = body

    // Bildirim var mı kontrol et
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Bildirim bulunamadı' },
        { status: 404 }
      )
    }

    // Kullanıcı yetkisi kontrolü
    if (userId && notification.userId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Bu bildirimi güncelleme yetkiniz yok' },
        { status: 403 }
      )
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: isRead ?? true,
        readAt: isRead !== false ? new Date() : null
      }
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json(
      { error: 'Bildirim güncellenemedi' },
      { status: 500 }
    )
  }
} 