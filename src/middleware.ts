import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session so it doesn't expire
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If there is no active session and the user is not on the login page,
  // redirect them to /login
  if (!user && !request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // If the user IS logged in and visits /login, send them to the dashboard
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Forward the verified user id to downstream Server Components so
  // src/app/(app)/layout.tsx doesn't have to call getUser() a second time.
  //
  // Setting request.headers directly does NOT propagate to the Server
  // Component render — Next.js only reads the header snapshot passed into
  // NextResponse.next({ request: { headers } }) at the point it's called.
  // So we rebuild the request headers with x-user-id added, then rebuild
  // supabaseResponse from that, copying over any Set-Cookie headers Supabase
  // already queued on the original supabaseResponse so the session refresh
  // from getUser() above isn't lost.
  if (user) {
    const forwardedHeaders = new Headers(request.headers)
    forwardedHeaders.set("x-user-id", user.id)

    const existingSetCookies = supabaseResponse.headers.getSetCookie()

    supabaseResponse = NextResponse.next({
      request: { headers: forwardedHeaders },
    })

    existingSetCookies.forEach((cookieString) => {
      supabaseResponse.headers.append("Set-Cookie", cookieString)
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets (images, svgs, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}