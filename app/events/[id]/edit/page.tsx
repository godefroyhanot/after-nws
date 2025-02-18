import { notFound } from 'next/navigation';
import EditForm from './EditForm';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    notFound();
  }

  return event;
}

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link 
        href={`/events/${params.id}`}
        className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
      >
        ← Retour à l'événement
      </Link>

      <h1 className="text-2xl font-bold mb-6">Modifier l'événement</h1>

      <EditForm event={event} />
    </div>
  );
} 