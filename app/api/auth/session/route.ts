import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

interface JwtPayload {
    userId: string
}

const SECRET = process.env.JWT_SECRET!

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        return Response.json({ isAuthenticated: false }, { status: 401 })
    }

    try {
        const decoded = jwt.verify(token, SECRET) as JwtPayload
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        })

        if (!user) {
            return Response.json({ isAuthenticated: false }, { status: 401 })
        }

        return Response.json({ isAuthenticated: true, user })
    } catch {
        return Response.json({ isAuthenticated: false }, { status: 401 })
    }
}
