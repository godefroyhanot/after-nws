'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";


type Event = {
  id: string;
  title: string;
  date: string;
  coverImage?: string | null;
  organizer?: {
    name: string;
  };
};

type FilterType = 'all' | 'upcoming' | 'past';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Générer la liste des mois disponibles à partir des événements
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    events.forEach(event => {
      const date = new Date(event.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  }, [events]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/events", {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des événements");
        }
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const filteredEvents = events
    .sort((a, b) => {
      const now = new Date();
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      // Calcule la différence absolue entre maintenant et la date de l'événement
      const diffA = Math.abs(dateA.getTime() - now.getTime());
      const diffB = Math.abs(dateB.getTime() - now.getTime());
      // Les événements futurs sont prioritaires
      if (dateA >= now && dateB < now) return -1;
      if (dateA < now && dateB >= now) return 1;
      // Ensuite, trie par proximité de date
      return diffA - diffB;
    })
    .filter(event => {
      const eventDate = new Date(event.date);
      const now = new Date();

      // Filtre par statut (passé/à venir)
      const statusFilter = filter === 'all' 
        ? true 
        : filter === 'upcoming' 
          ? eventDate >= now 
          : eventDate < now;

      // Filtre par mois
      const monthFilter = selectedMonth === 'all' 
        ? true 
        : `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}` === selectedMonth;

      return statusFilter && monthFilter;
    });

  const formatMonthLabel = (monthKey: string) => {
    if (monthKey === 'all') return 'Tous les mois';
    const [year, month] = monthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/Logo-NWS.svg"
              alt="Logo After NWS"
              width={50}
              height={50}
              className="rounded-lg"
            />
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

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tous les événements
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Nouveaux événements
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Événements passés
          </button>
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 cursor-pointer hover:border-gray-400 transition-colors"
        >
          <option value="all">Tous les mois</option>
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {formatMonthLabel(month)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Chargement des événements...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event: Event) => (
              <div
                key={event.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative"
              >
                {new Date(event.date) < new Date() && (
                  <div className="absolute top-5 -left-8 bg-red-600 text-white px-8 py-1 transform -rotate-45 shadow-md z-10 w-32 text-center">
                    Passé
                  </div>
                )}
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
              {filter === 'all'
                ? "Aucun événement n'a encore été créé."
                : filter === 'upcoming'
                ? "Aucun événement à venir."
                : "Aucun événement passé."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
