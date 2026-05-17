import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAuthed = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login');

  if (!isAuthed && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (isAuthed && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
