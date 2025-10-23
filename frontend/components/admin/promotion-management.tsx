"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PromotionManagementProps {
  promotions: any[]
}

export function PromotionManagement({ promotions: initialPromotions }: PromotionManagementProps) {
  const [promotions, setPromotions] = useState(initialPromotions)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
  })

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
    })
    setEditingPromo(null)
  }

  const handleEdit = (promo: any) => {
    setEditingPromo(promo)
    setFormData({
      title: promo.title,
      description: promo.description || "",
      image: promo.image || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createBrowserClient()

    try {
      const promoData = {
        title: formData.title,
        description: formData.description,
        image: formData.image || null,
      }

      if (editingPromo) {
        const { error } = await supabase.from("promotions").update(promoData).eq("id", editingPromo.id)

        if (error) throw error

        setPromotions((prev) =>
          prev.map((promo) => (promo.id === editingPromo.id ? { ...promo, ...promoData } : promo)),
        )

        toast({
          title: "Promotion mise à jour",
          description: "La promotion a été modifiée avec succès",
        })
      } else {
        const { data, error } = await supabase.from("promotions").insert(promoData).select().single()

        if (error) throw error

        setPromotions((prev) => [data, ...prev])

        toast({
          title: "Promotion ajoutée",
          description: "La nouvelle promotion a été créée",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      console.error("Error saving promotion:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (promoId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) return

    const supabase = createBrowserClient()

    try {
      const { error } = await supabase.from("promotions").delete().eq("id", promoId)

      if (error) throw error

      setPromotions((prev) => prev.filter((promo) => promo.id !== promoId))

      toast({
        title: "Promotion supprimée",
        description: "La promotion a été retirée",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting promotion:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des promotions</h2>
          <p className="text-muted-foreground">Créez et gérez les promotions affichées sur la page d'accueil</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
              className="bg-secondary text-white hover:bg-secondary-light"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPromo ? "Modifier la promotion" : "Nouvelle promotion"}</DialogTitle>
              <DialogDescription>
                {editingPromo ? "Modifiez les informations de la promotion" : "Créez une nouvelle promotion"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de l'image</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" className="bg-secondary text-white hover:bg-secondary-light">
                  {editingPromo ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.map((promo) => (
          <Card key={promo.id} className="overflow-hidden">
            <div className="aspect-[3/1] relative">
              <img
                src={promo.image || "/placeholder.svg?height=200&width=600"}
                alt={promo.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{promo.title}</CardTitle>
              <CardDescription>{promo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(promo)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive flex-1 bg-transparent"
                  onClick={() => handleDelete(promo.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {promotions.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aucune promotion</CardTitle>
            <CardDescription>Créez votre première promotion pour commencer</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
