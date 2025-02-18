'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import party from 'party-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const MAX_IMAGE_SIZE = 800; // pixels

async function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculer les nouvelles dimensions en gardant le ratio
      if (width > height) {
        if (width > MAX_IMAGE_SIZE) {
          height = Math.round((height * MAX_IMAGE_SIZE) / width);
          width = MAX_IMAGE_SIZE;
        }
      } else {
        if (height > MAX_IMAGE_SIZE) {
          width = Math.round((width * MAX_IMAGE_SIZE) / height);
          height = MAX_IMAGE_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Impossible de créer le contexte canvas"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir en JPEG avec une qualité plus basse pour réduire la taille
      const maxAttempts = 5;
      let quality = 0.8;
      let attempt = 0;
      let result: string;

      do {
        result = canvas.toDataURL('image/jpeg', quality);
        quality -= 0.1;
        attempt++;
      } while (result.length > 1024 * 1024 && attempt < maxAttempts); // Essayer de garder sous 1MB

      if (result.length > 2 * 1024 * 1024) { // Si toujours plus de 2MB
        reject(new Error("L'image est trop volumineuse même après compression"));
        return;
      }

      resolve(result);
    };
    img.onerror = reject;
  });
}

export default function NewEventPage() {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    coverImage: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedImage = await resizeImage(file);
        setFormData({ ...formData, coverImage: resizedImage });
      } catch (error) {
        console.error('Erreur lors du redimensionnement de l\'image:', error);
        toast.error('Erreur lors du traitement de l\'image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Vérifier la taille de l'image avant l'envoi
      if (formData.coverImage && formData.coverImage.length > 2 * 1024 * 1024) {
        throw new Error("L'image est trop volumineuse. Veuillez choisir une image plus petite.");
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        body: formDataToSend,
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse:', e);
        if (!response.ok) {
          throw new Error("Erreur lors de la création de l'événement");
        }
      }

      if (!response.ok) {
        throw new Error(
          responseData?.error || "Erreur lors de la création de l'événement"
        );
      }

      if (buttonRef.current) {
        party.confetti(buttonRef.current, {
          count: party.variation.range(30, 40),
        });
      }
      toast.success('Événement créé avec succès !');
      setTimeout(() => {
        router.push('/events');
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de l\'événement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Créer un nouvel événement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-32"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                type="datetime-local"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Image de couverture</Label>
              <Input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {formData.coverImage && (
                <div className="mt-2">
                  <img
                    src={formData.coverImage}
                    alt="Aperçu"
                    className="max-h-48 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            <Button
              ref={buttonRef}
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création en cours...' : 'Créer l\'événement'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => window.location.href = '/events'}
              disabled={isSubmitting}
            >
              Retour à la liste
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 