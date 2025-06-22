import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route koruma yapılandırması
const routePermissions = {
  // NORMAL kullanıcının GİREMEYECEĞİ sayfalar
  '/frontend/addingproject': ['PROJE'],
  '/frontend/addingsponsor': ['SPONSOR'],
  '/frontend/projectProfile': ['PROJE'],
  '/frontend/sponsorProfile': ['SPONSOR'],
}

// Herkesın erişebileceği genel sayfalar
const publicRoutes = [
  '/frontend/mainPage',
  '/frontend/settingsPage',
  '/frontend/registerPage',
  '/frontend/unauthorized',
  '/frontend/projectDetail',
  '/frontend/project/edit',
  '/frontend/team/manage',
  '/frontend/sponsorDetail',
  '/frontend/sponsorProfile',
  '/frontend/projectProfile',
  '/frontend/addingproject',
  '/frontend/profilePage',
  '/frontend/user', // Public user profiles
  '/frontend/settingsPage/profile',
  '/frontend/settingsPage/profile/edit',
  '/frontend/settingsPage/help',
  '/api/auth/login',
  '/api/auth/register',
  '/api/sponsors',
  '/api/projects',
  '/api/user',
]

// Geçerli tüm route'lar
const validRoutes = [
  '/frontend/mainPage',
  '/frontend/settingsPage',
  '/frontend/registerPage',
  '/frontend/unauthorized',
  '/frontend/addingproject',
  '/frontend/addingsponsor',
  '/frontend/projectProfile',
  '/frontend/sponsorProfile',
  '/frontend/profilePage',
  '/frontend/profilePage/normal',
  '/frontend/profilePage/proje',
  '/frontend/profilePage/sponsor',
  '/frontend/user', // Public user profiles
  '/frontend/settingsPage/profile',
  '/frontend/settingsPage/profile/edit',
  '/frontend/settingsPage/help',
  '/frontend/projectDetail',
  '/frontend/sponsorDetail',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // API route'ları hariç tut (bunlar kendi auth kontrollerini yapar)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Static dosyalar ve _next dosyaları hariç tut
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Ana sayfa ve genel sayfalar için kontrol yapma
  if (pathname === '/' || publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Dinamik route'lar için özel kontrol
  const isDynamicRoute = pathname.match(/\/frontend\/(projectDetail|sponsorDetail|user)\/\d+$/)
  
  // Geçerli route mu kontrol et
  const isValidRoute = validRoutes.some(route => pathname.startsWith(route)) || isDynamicRoute

  // Geçersiz route ise unauthorized'a yönlendir
  if (!isValidRoute) {
    const errorUrl = new URL('/frontend/unauthorized', request.url)
    errorUrl.searchParams.set('reason', 'Aradığınız sayfa bulunamadı. Lütfen geçerli bir sayfa adresini kontrol edin.')
    return NextResponse.redirect(errorUrl)
  }

  // Cookie'den kullanıcı bilgilerini al
  const userCookie = request.cookies.get('user')
  
  console.log('Middleware - Cookie check:', { 
    hasCookie: !!userCookie, 
    pathname,
    cookieValue: userCookie?.value ? userCookie.value : 'null'
  })
  
  // Kullanıcı giriş yapmamışsa unauthorized'a yönlendir
  if (!userCookie) {
    console.log('No user cookie found, redirecting to unauthorized')
    const errorUrl = new URL('/frontend/unauthorized', request.url)
    errorUrl.searchParams.set('reason', 'Bu sayfaya erişmek için giriş yapmanız gerekmektedir.')
    return NextResponse.redirect(errorUrl)
  }

  try {
    // Kullanıcı bilgilerini parse et
    const user = JSON.parse(userCookie.value)
    const userType = user.userType
    
    console.log('Middleware - User:', { userType, pathname, user: JSON.stringify(user) })

    // Profil sayfası yönlendirme kontrolü - önce bu kontrolü yap
    if (pathname === '/frontend/profilePage') {
      const correctProfilePath = getCorrectProfilePath(userType)
      console.log('Redirecting to correct profile path:', correctProfilePath)
      const redirectUrl = new URL(correctProfilePath, request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Route için gerekli yetkileri kontrol et
    for (const [route, allowedTypes] of Object.entries(routePermissions)) {
      if (pathname.startsWith(route)) {
        console.log('Route permission check:', { route, userType, allowedTypes, hasAccess: allowedTypes.includes(userType) })
        
        // Kullanıcı bu route'a erişim yetkisi var mı?
        if (!allowedTypes.includes(userType)) {
          console.log('Access denied for route:', route)
          // Kullanıcı tipine göre uygun error sayfasına yönlendir
          const errorUrl = new URL('/frontend/unauthorized', request.url)
          errorUrl.searchParams.set('reason', getErrorReason(userType, route))
          return NextResponse.redirect(errorUrl)
        }
        console.log('Access granted for route:', route)
        break
      }
    }

    return NextResponse.next()
    
  } catch (error) {
    // Cookie parse edilemezse unauthorized'a yönlendir
    console.error('User cookie parse error:', error)
    const errorUrl = new URL('/frontend/unauthorized', request.url)
    errorUrl.searchParams.set('reason', 'Kullanıcı bilgileriniz doğrulanamadı. Lütfen tekrar giriş yapın.')
    return NextResponse.redirect(errorUrl)
  }
}

// Kullanıcı tipine göre doğru profil yolunu döndür
function getCorrectProfilePath(userType: string): string {
  switch (userType) {
    case 'SPONSOR':
      return '/frontend/profilePage/sponsor'
    case 'PROJE':
      return '/frontend/profilePage/proje'
    default:
      return '/frontend/profilePage/normal'
  }
}

// Hata nedenini belirle
function getErrorReason(userType: string, attemptedRoute: string): string {
  if (attemptedRoute.includes('addingproject')) {
    return 'Proje ekleme sadece PROJE hesabı olan kullanıcılar için mümkündür.'
  }
  if (attemptedRoute.includes('addingsponsor')) {
    return 'Sponsor ekleme sadece SPONSOR hesabı olan kullanıcılar için mümkündür.'
  }
  if (attemptedRoute.includes('projectProfile')) {
    return 'Proje profili sadece PROJE hesabı olan kullanıcılar için erişilebilir.'
  }
  if (attemptedRoute.includes('sponsorProfile')) {
    return 'Sponsor profili sadece SPONSOR hesabı olan kullanıcılar için erişilebilir.'
  }
  return 'Bu sayfaya erişim yetkiniz bulunmamaktadır.'
}

// Middleware'in hangi route'larda çalışacağını belirle
export const config = {
  matcher: [
    /*
     * Şu path'lar hariç tüm route'larda çalış:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 