import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()
const DEFAULT_ORGANIZER_EMAIL = 'franky@normandiewebschool.fr'

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            orderBy: {
                date: 'asc',
            },
            include: {
                organizer: {
                    select: {
                        name: true,
                    },
                },
            },
        })

        if (!events || events.length === 0) {
            return NextResponse.json({ events: [] }, { status: 200 })
        }

        return NextResponse.json(events, { status: 200 })
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'Erreur inconnue'
        return NextResponse.json(
            {
                error: `Erreur lors de la récupération des événements: ${errorMessage}`,
            },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const date = formData.get('date') as string;
        const coverImage = formData.get('coverImage') as string;

        if (!title || !description || !date) {
            return NextResponse.json(
                { error: "Le titre, la description et la date sont requis" },
                { status: 400 }
            )
        }

        // Récupérer l'utilisateur par défaut
        const defaultOrganizer = await prisma.user.findUnique({
            where: {
                email: DEFAULT_ORGANIZER_EMAIL,
            },
        })

        if (!defaultOrganizer) {
            return NextResponse.json(
                { error: "Organisateur par défaut non trouvé" },
                { status: 404 }
            )
        }

        // Vérifier la taille de l'image
        if (coverImage && coverImage.length > 5 * 1024 * 1024) { // 5MB max
            return NextResponse.json(
                { error: "L'image est trop volumineuse. Taille maximum : 5MB" },
                { status: 400 }
            )
        }

        try {
            const event = await prisma.event.create({
                data: {
                    title,
                    description,
                    date: new Date(date),
                    coverImage: coverImage || null,
                    organizerId: defaultOrganizer.id,
                },
            })

            return NextResponse.json({ success: true, event }, { status: 201 })
        } catch (error) {
            console.error("Erreur Prisma:", error)
            return NextResponse.json(
                { error: "Erreur lors de la création dans la base de données" },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error("Erreur lors de la création de l'événement:", error)
        return NextResponse.json(
            { error: "Une erreur est survenue lors de la création de l'événement" },
            { status: 500 }
        )
    }
}
