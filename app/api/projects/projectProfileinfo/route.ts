import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Projeleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      // Belirli bir kullanıcının oluşturduğu projeleri getir
      const projects = await prisma.project.findMany({
        where: { 
          // @ts-ignore
          userId: parseInt(userId) 
        },
        include: {
          sponsorYatirimlar: {
            where: {
              // @ts-ignore
              status: 'ACCEPTED' // Sadece onaylanmış yatırımları getir
            },
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
          form: true,
          team: {
            include: {
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
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      return NextResponse.json(projects)
    } else {
      // Tüm projeleri getir
      const projects = await prisma.project.findMany({
        include: {
          sponsorYatirimlar: {
            where: {
              // @ts-ignore
              status: 'ACCEPTED' // Sadece onaylanmış yatırımları getir
            },
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
          form: true,
          team: {
            include: {
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
                }
              }
            }
          },
          // @ts-ignore
          user: {
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
      
      return NextResponse.json(projects)
    }
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası!' },
      { status: 500 }
    )
  }
}

 