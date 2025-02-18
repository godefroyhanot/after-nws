"use client";

import Link from "next/link";

export default function EditButton({ eventId }: { eventId: string }) {
  return (
    <Link
      href={`/events/${eventId}/edit`}
      className="mt-4 mr-4 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors inline-block"
    >
      Modifier l&apos;événement
    </Link>
  );
}
