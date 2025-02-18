'use client';

export default function DeleteButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <button 
        type="submit"
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        onClick={(e) => {
          if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            e.preventDefault();
          }
        }}
      >
        Supprimer l'événement
      </button>
    </form>
  );
} 