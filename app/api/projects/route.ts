import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Eğer userId parametresi varsa, sadece o kullanıcının projelerini getir
    const whereClause = userId ? { userId: parseInt(userId) } : {}

    const projects = await prisma.project.findMany({
      where: whereClause,
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
        { createdAt: 'asc' } // Total puanı aynı olanlar arasında eski olanlar üstte
      ]
    })

    return NextResponse.json(projects)

  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
} 