import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  // console.log("Middleware running for path:", req.nextUrl.pathname);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  // console.log('token', token)

  // Allow the requests if the following is true...
  // 1) It's a request for next-auth session & provider fetching
  // 2) The token exists
  if (pathname.includes("/api/auth") || token) {
    return NextResponse.next();
  }

  // Redirect to login page if the user is not authenticated
  if (!token && pathname !== "/authentication/login") {
    return NextResponse.redirect(new URL("/authentication/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */

    // "/((?!api|_next/static|_next/image|favicon.ico|authentication).*)",
    "/((?!api|_next/static|_next/image|favicon.ico|authentication/login|authentication/signUp|authentication/forgot-password|authentication/*).*)",
  ],
};

// export { auth as middleware } from "@/auth";
