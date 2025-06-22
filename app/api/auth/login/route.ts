import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Gerekli alanları kontrol et
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre alanları zorunludur!' },
        { status: 400 }
      )
    }

    // Kullanıcıyı email ile bul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı!' },
        { status: 401 }
      )
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı!' },
        { status: 401 }
      )
    }

    // Kullanıcı bilgilerini döndür (şifre hariç) - yeni alanlar dahil
    const userResponse = {
      id: user.id,
      adsoyad: user.adsoyad,
      email: user.email,
      userType: user.userType,
      profilFoto: user.profilFoto,
      hakkimda: user.hakkimda,
      website: user.website,
      twitter: user.twitter,
      linkedin: user.linkedin,
      instagram: user.instagram,
      github: user.github,
      projectIds: user.projectIds,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }

    return NextResponse.json({
      message: 'Giriş başarılı!',
      user: userResponse
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
} 