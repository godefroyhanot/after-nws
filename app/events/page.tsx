import Link from 'next/link';

type Event = {
  id: string;
  title: string;
  date: string;
  organizer?: {
    name: string;
  };
};

async function getEvents() {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/events', {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des événements');
  }
  return res.json() as Promise<Event[]>;
}

export default async function Events() {
  const events = await getEvents();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des événements</h1>
        <Link 
          href="/events/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Créer un événement
        </Link>
      </div>
      
      <div className="grid gap-4">
        {events.map((event: Event) => (
          <div 
            key={event.id} 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <Link href={`/events/${event.id}`} className="block">
              <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
              <div className="text-gray-600">
                <p>Date : {new Date(event.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p>Organisateur : {event.organizer?.name || 'Non spécifié'}</p>
              </div>
            </Link>
          </div>
        ))}
        
        {events.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Aucun événement n'a encore été créé.
          </p>
        )}
      </div>
    </div>
  );
} 