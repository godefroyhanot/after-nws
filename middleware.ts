import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value

    // Ne pas rediriger si on est déjà sur la page de login
    if (req.nextUrl.pathname === '/login') {
        return NextResponse.next()
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    try {
        await jwtVerify(token, SECRET)
        return NextResponse.next()
    } catch (error) {
        console.log('Middleware - Erreur de vérification du token:', error)
        return NextResponse.redirect(new URL('/login', req.url))
    }
}

export const config = {
    matcher: ['/events/:path*', '/login'],
}
