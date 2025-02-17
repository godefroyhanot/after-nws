import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEFAULT_ORGANIZER_EMAIL = 'franky@normandiewebschool.fr';

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
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, date } = await request.json();

    // Récupérer l'utilisateur par défaut
    const defaultOrganizer = await prisma.user.findUnique({
      where: {
        email: DEFAULT_ORGANIZER_EMAIL,
      },
    });

    if (!defaultOrganizer) {
      throw new Error('Organisateur par défaut non trouvé');
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        organizerId: defaultOrganizer.id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    );
  }
} 