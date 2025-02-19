import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const resolvedParams = await params
        const event = await prisma.event.findUnique({
            where: {
                id: resolvedParams.id,
            },
            include: {
                organizer: {
                    select: {
                        name: true,
                    },
                },
            },
        })

        if (!event) {
            return NextResponse.json(
                { error: 'Événement non trouvé' },
                { status: 404 }
            )
        }

        return NextResponse.json(event)
    } catch (error) {
        console.error("Erreur lors de la récupération de l'événement:", error)
        return NextResponse.json(
            { error: "Erreur lors de la récupération de l'événement" },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const event = await prisma.event.update({
            where: { id: params.id },
            data: {
                title: body.title,
                description: body.description,
                date: body.date,
            },
        })

        return NextResponse.json(event)
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'événement:", error)
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour' },
            { status: 500 }
        )
    }
}
