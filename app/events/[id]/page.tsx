import Link from 'next/link';
import { notFound } from 'next/navigation';

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  organizer?: {
    name: string;
  };
};

async function getEvent(id: string): Promise<Event> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    notFound();
  }

  return res.json();
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link 
        href="/events"
        className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
      >
        ← Retour aux événements
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
        
        <div className="grid gap-4 text-gray-600 mb-6">
          <p>
            <span className="font-semibold">Date :</span>{' '}
            {new Date(event.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p>
            <span className="font-semibold">Organisateur :</span>{' '}
            {event.organizer?.name || 'Non spécifié'}
          </p>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="whitespace-pre-wrap">{event.description}</p>
        </div>
      </div>
    </div>
  );
} 