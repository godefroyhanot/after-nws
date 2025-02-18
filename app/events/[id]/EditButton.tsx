'use client';

import Link from 'next/link';

export default function EditButton({ eventId }: { eventId: string }) {
  return (
    <Link
      href={`/events/${eventId}/edit`}
      className="mt-4 mr-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors inline-block"
    >
      Modifier l'événement
    </Link>
  );
} 