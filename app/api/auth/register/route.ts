import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, profileType } = await req.json()

    // Validate profileType
    if (!['user', 'project', 'sponsor'].includes(profileType)) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz profil tipi' }),
        { status: 400 }
      )
    }

    // Convert profileType to uppercase for Prisma enum
    const dbProfileType = profileType.toUpperCase() as 'USER' | 'PROJECT' | 'SPONSOR'

    // Debug için log
    console.log('Gelen veri:', { firstName, lastName, email })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        profileType: dbProfileType,
      },
    })

    // Debug için log
    console.log('Oluşturulan kullanıcı:', user)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileType: user.profileType,
      }
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanımda' },
        { status: 400 }
      )
    }
    
    // Hata detayını görmek için
    console.error('Kayıt hatası:', error)
    
    return NextResponse.json(
      { error: 'Kayıt işlemi başarısız oldu' },
      { status: 500 }
    )
  }
} 