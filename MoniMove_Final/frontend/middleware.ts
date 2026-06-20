import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_USER = '/HomePage';
const PROTECTED_ADMIN = '/admin';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('monimove_auth')?.value;
  const roleCookie = request.cookies.get('monimove_role')?.value;

  const isProtected =
    pathname.startsWith(PROTECTED_USER) || pathname.startsWith(PROTECTED_ADMIN);

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!authCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/';
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith(PROTECTED_ADMIN) && roleCookie !== 'admin') {
    const userUrl = request.nextUrl.clone();
    userUrl.pathname = PROTECTED_USER;
    return NextResponse.redirect(userUrl);
  }

  if (pathname.startsWith(PROTECTED_USER) && roleCookie === 'admin') {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = PROTECTED_ADMIN;
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/HomePage/:path*', '/admin/:path*'],
};
