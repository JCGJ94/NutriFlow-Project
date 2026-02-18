import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create supabase client for middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 1. If user is logged in and visits Landing Page, Login, or Register -> Redirect to Dashboard
    if (user) {
        const isAuthRoute = request.nextUrl.pathname === '/' ||
            request.nextUrl.pathname.startsWith('/login') ||
            request.nextUrl.pathname.startsWith('/register');

        if (isAuthRoute) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // 2. If user is NOT logged in and visits Protected Routes -> Redirect to Login
    if (!user) {
        const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/settings') ||
            request.nextUrl.pathname.startsWith('/plan') ||
            request.nextUrl.pathname.startsWith('/shopping-list') ||
            request.nextUrl.pathname.startsWith('/onboarding') ||
            request.nextUrl.pathname.startsWith('/protocols');

        if (isProtectedRoute) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (API routes - handled separately, usually)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|api).*)',
    ],
}
