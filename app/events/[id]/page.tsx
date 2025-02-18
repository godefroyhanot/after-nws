import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";

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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    notFound();
  }

  return res.json();
}

async function deleteEvent(id: string) {
  "use server";

  try {
    await prisma.event.delete({
      where: { id },
    });
    revalidatePath("/events");
    redirect("/events");
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    throw new Error("Impossible de supprimer l'événement");
  }
}

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const awaitParams = await params;
  const event = await getEvent(awaitParams.id);
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link
        href="/events"
        className="text-teal-600 hover:text-teal-800 mb-6 inline-block"
      >
        ← Retour aux événements
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

        <div className="grid gap-4 text-gray-600 mb-6">
          <p>
            <span className="font-semibold">Date :</span>{" "}
            {new Date(event.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p>
            <span className="font-semibold">Organisateur :</span>{" "}
            {event.organizer?.name || "Non spécifié"}
          </p>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="whitespace-pre-wrap">{event.description}</p>
        </div>
      </div>

      <div className="flex">
        <EditButton eventId={event.id} />
        <DeleteButton
          action={async () => {
            "use server";
            await deleteEvent(event.id);
          }}
        />
      </div>
    </div>
  );
}
