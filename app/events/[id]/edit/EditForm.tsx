'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  coverImage?: string | null;
};

export default function EditForm({ event }: { event: Event }) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(event.coverImage);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const response = await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: formData.get('title'),
        description: formData.get('description'),
        date: new Date(formData.get('date') as string).toISOString(),
        coverImage: imagePreview,
      }),
    });

    if (response.ok) {
      router.push(`/events/${event.id}`);
      router.refresh();
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Titre
        </label>
        <input
          type="text"
          name="title"
          id="title"
          defaultValue={event.title}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date et heure
        </label>
        <input
          type="datetime-local"
          name="date"
          id="date"
          defaultValue={new Date(event.date).toISOString().slice(0, 16)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          defaultValue={event.description}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Image de couverture
        </label>
        <input
          type="file"
          name="image"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full"
        />
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Aperçu"
              className="max-w-xs h-auto rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Enregistrer les modifications
        </button>
        <Link
          href={`/events/${event.id}`}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Annuler
        </Link>
      </div>
    </form>
  );
} 