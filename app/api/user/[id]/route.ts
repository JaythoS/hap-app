import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı ID!' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        teamMemberships: {
          select: {
            id: true,
            role: true,
            status: true,
            joinedAt: true,
            team: {
              select: {
                id: true,
                name: true,
                project: {
                  select: {
                    id: true,
                    projeAdi: true,
                    projeKonusu: true,
                    takimAdi: true,
                    takimKurulusYili: true,
                    takimEgitimSeviyesi: true,
                    katilimIli: true,
                    projeOzeti: true,
                    resim: true,
                    sponsorYatirimlar: {
                      select: {
                        id: true,
                        yatirimMiktari: true,
                        status: true,
                        sponsor: {
                          select: {
                            id: true,
                            sponsorAdi: true
                          }
                        }
                      }
                    },
                    team: {
                      select: {
                        id: true,
                        name: true,
                        members: {
                          select: {
                            id: true,
                            role: true,
                            status: true,
                            userId: true,
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
                          where: {
                            status: {
                              not: 'REMOVED'
                            }
                          }
                        }
                      }
                    },
                    createdAt: true,
                    updatedAt: true
                  }
                }
              }
            }
          },
          where: {
            status: {
              in: ['ACTIVE', 'PENDING']
            }
          }
        },
        sponsors: {
          select: {
            id: true,
            sponsorAdi: true,
            resim: true,
            hakkimizda: true,
            website: true,
            email: true,
            telefon: true,
            createdAt: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı!' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı ID!' },
        { status: 400 }
      )
    }

    const data = await request.json()
    const { 
      adsoyad, 
      profilFoto, 
      hakkimda,
      website, 
      twitter, 
      linkedin, 
      instagram, 
      github
    } = data

    // Kullanıcının var olup olmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı!' },
        { status: 404 }
      )
    }

    // Kullanıcı bilgilerini güncelle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(adsoyad && { adsoyad: adsoyad.trim() }),
        ...(profilFoto !== undefined && { profilFoto }),
        ...(hakkimda !== undefined && { hakkimda }),
        ...(website !== undefined && { website }),
        ...(twitter !== undefined && { twitter }),
        ...(linkedin !== undefined && { linkedin }),
        ...(instagram !== undefined && { instagram }),
        ...(github !== undefined && { github })
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
        teamMemberships: {
          select: {
            id: true,
            role: true,
            status: true,
            joinedAt: true,
            team: {
              select: {
                id: true,
                name: true,
                project: {
                  select: {
                    id: true,
                    projeAdi: true,
                    projeKonusu: true,
                    takimAdi: true,
                    takimKurulusYili: true,
                    takimEgitimSeviyesi: true,
                    katilimIli: true,
                    projeOzeti: true,
                    resim: true,
                    sponsorYatirimlar: {
                      select: {
                        id: true,
                        yatirimMiktari: true,
                        status: true,
                        sponsor: {
                          select: {
                            id: true,
                            sponsorAdi: true
                          }
                        }
                      }
                    },
                    team: {
                      select: {
                        id: true,
                        name: true,
                        members: {
                          select: {
                            id: true,
                            role: true,
                            status: true,
                            userId: true,
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
                          where: {
                            status: {
                              not: 'REMOVED'
                            }
                          }
                        }
                      }
                    },
                    createdAt: true,
                    updatedAt: true
                  }
                }
              }
            }
          },
          where: {
            status: {
              in: ['ACTIVE', 'PENDING']
            }
          }
        },
        sponsors: {
          select: {
            id: true,
            sponsorAdi: true,
            resim: true,
            hakkimizda: true,
            website: true,
            email: true,
            telefon: true,
            createdAt: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Kullanıcı bilgileri başarıyla güncellendi!',
      user: updatedUser
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
} 