import Link from "next/link";
import Image from "next/image";

type Event = {
  id: string;
  title: string;
  date: string;
  coverImage?: string | null;
  organizer?: {
    name: string;
  };
};

async function getEvents() {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/events", {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des événements");
  }
  return res.json() as Promise<Event[]>;
}

export default async function Events() {
  const events = await getEvents();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Retour
          </Link>
          <h1 className="text-2xl font-bold">Liste des événements</h1>
        </div>
        <Link
          href="/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Créer un événement
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.length > 0 ? (
          events.map((event: Event) => (
            <div
              key={event.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link href={`/events/${event.id}`} className="block">
                <div className="aspect-video relative">
                  {event.coverImage ? (
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Pas d'image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                  <div className="text-gray-600">
                    <p>
                      Date :{" "}
                      {new Date(event.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p>
                      Organisateur : {event.organizer?.name || "Non spécifié"}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8 col-span-full">
            Aucun événement n'a encore été créé.
          </p>
        )}
      </div>
    </div>
  );
}
