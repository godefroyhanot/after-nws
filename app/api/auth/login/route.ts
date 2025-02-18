import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function POST(req: Request) {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return Response.json(
            { error: 'Identifiants incorrects' },
            { status: 401 }
        )
    }

    // Générer le JWT avec jose
    const token = await new SignJWT({ userId: user.id })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(SECRET)

    // Créer la réponse
    const response = Response.json({ success: true })

    // Définir le cookie dans la réponse
    ;(await cookies()).set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
    })

    return response
}
