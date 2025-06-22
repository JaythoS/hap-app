import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { adsoyad, email, password, userType } = await request.json()

    // Gerekli alanları kontrol et
    if (!adsoyad || !email || !password) {
      return NextResponse.json(
        { error: 'Ad soyad, email ve şifre alanları zorunludur!' },
        { status: 400 }
      )
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi girin!' },
        { status: 400 }
      )
    }

    // Şifre uzunluğunu kontrol et
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalı!' },
        { status: 400 }
      )
    }

    // UserType kontrolü
    const validUserTypes = ['NORMAL', 'PROJE', 'SPONSOR']
    if (!validUserTypes.includes(userType)) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı tipi!' },
        { status: 400 }
      )
    }

    // Email'in daha önce kullanılıp kullanılmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor!' },
        { status: 400 }
      )
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 12)

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        adsoyad: adsoyad.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        userType: userType as 'NORMAL' | 'PROJE' | 'SPONSOR',
        // Sosyal medya alanları ve projectIds varsayılan değerlerle kalacak
      },
      select: {
        id: true,
        adsoyad: true,
        email: true,
        userType: true,
        profilFoto: true,
        hakkimda: true,
        website: true,
        twitter: true,
        linkedin: true,
        instagram: true,
        github: true,
        createdAt: true
      }
    })

    // Hoşgeldin bildirimini oluştur
    let welcomeTitle = "🎉 HAP'a Hoş Geldiniz!"
    let welcomeMessage = ""

    // Kullanıcı tipine göre özel mesaj
    switch (userType) {
      case "SPONSOR":
        welcomeTitle = "🤝 Sponsor Olarak HAP'a Hoş Geldiniz!"
        welcomeMessage = `Merhaba ${user.adsoyad.split(' ')[0]}, HAP platformuna sponsor olarak katıldığınız için teşekkür ederiz! Burada yenilikçi projeleri keşfedebilir ve destekleyebilirsiniz. İyi sponsorluklar!`
        break
      case "PROJE":
        welcomeTitle = "🚀 Proje Hesabı Olarak HAP'a Hoş Geldiniz!"
        welcomeMessage = `Merhaba ${user.adsoyad.split(' ')[0]}, HAP platformuna proje hesabı olarak katıldığınız için teşekkür ederiz! Projelerinizi paylaşabilir, takım üyeleri bulabilir ve sponsorlarla bağlantı kurabilirsiniz. Başarılar!`
        break
      default:
        welcomeTitle = "🎉 HAP'a Hoş Geldiniz!"
        welcomeMessage = `Merhaba ${user.adsoyad.split(' ')[0]}, HAP platformuna katıldığınız için teşekkür ederiz! Burada yenilikçi projeleri keşfedebilir, takımlara katılabilir ve girişimcilik dünyasında yer alabilirsiniz. Keyifli keşifler!`
    }

    // Hoşgeldin bildirimi oluştur
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'GENERAL',
          title: welcomeTitle,
          message: welcomeMessage,
          data: {
            welcomeMessage: true,
            userType: userType,
            joinDate: new Date()
          }
        }
      })
    } catch (notificationError) {
      console.error('Hoşgeldin bildirimi oluşturulamadı:', notificationError)
      // Bildirim oluşturulamazsa kayıt işlemini durdurmayalım
    }

    return NextResponse.json({
      message: 'Hesap başarıyla oluşturuldu!',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
} 