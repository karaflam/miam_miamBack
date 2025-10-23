"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MenuManagementProps {
  menuItems: any[]
}

export function MenuManagement({ menuItems: initialItems }: MenuManagementProps) {
  const [menuItems, setMenuItems] = useState(initialItems)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "plat",
    isAvailable: true,
    isSpecial: false,
    image: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "plat",
      isAvailable: true,
      isSpecial: false,
      image: "",
    })
    setEditingItem(null)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || "",
      price: (item.price / 100).toString(),
      category: item.category,
      isAvailable: item.isAvailable,
      isSpecial: item.isSpecial,
      image: item.image || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createBrowserClient()

    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseInt(formData.price) * 100,
        category: formData.category,
        isAvailable: formData.isAvailable,
        isSpecial: formData.isSpecial,
        image: formData.image || null,
      }

      if (editingItem) {
        const { error } = await supabase.from("menu_items").update(itemData).eq("id", editingItem.id)

        if (error) throw error

        setMenuItems((prev) => prev.map((item) => (item.id === editingItem.id ? { ...item, ...itemData } : item)))

        toast({
          title: "Article mis à jour",
          description: "L'article a été modifié avec succès",
        })
      } else {
        const { data, error } = await supabase.from("menu_items").insert(itemData).select().single()

        if (error) throw error

        setMenuItems((prev) => [...prev, data])

        toast({
          title: "Article ajouté",
          description: "Le nouvel article a été ajouté au menu",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      console.error("Error saving menu item:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return

    const supabase = createBrowserClient()

    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", itemId)

      if (error) throw error

      setMenuItems((prev) => prev.filter((item) => item.id !== itemId))

      toast({
        title: "Article supprimé",
        description: "L'article a été retiré du menu",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      })
    }
  }

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    const supabase = createBrowserClient()

    try {
      const { error } = await supabase.from("menu_items").update({ isAvailable: !currentStatus }).eq("id", itemId)

      if (error) throw error

      setMenuItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, isAvailable: !currentStatus } : item)))

      router.refresh()
    } catch (error) {
      console.error("Error toggling availability:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    }
  }

  const groupedItems = menuItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion du menu</h2>
          <p className="text-muted-foreground">Gérez les articles du menu</p>
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
              Ajouter un article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Modifiez les informations de l'article" : "Ajoutez un nouvel article au menu"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (F)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plat">Plat</SelectItem>
                      <SelectItem value="boisson">Boisson</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="entree">Entrée</SelectItem>
                    </SelectContent>
                  </Select>
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
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                  />
                  <Label htmlFor="available">Disponible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="special"
                    checked={formData.isSpecial}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSpecial: checked })}
                  />
                  <Label htmlFor="special">Spécial du jour</Label>
                </div>
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
                  {editingItem ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {Object.entries(groupedItems).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category}</CardTitle>
            <CardDescription>{items.length} article(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-surface rounded-lg">
                  <img
                    src={item.image || "/placeholder.svg?height=80&width=80"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.isSpecial && <Badge className="bg-primary text-secondary">Spécial</Badge>}
                      {!item.isAvailable && <Badge variant="secondary">Indisponible</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                    <p className="text-lg font-bold text-primary mt-1">{(item.price / 100).toFixed(0)}F</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={() => toggleAvailability(item.id, item.isAvailable)}
                    />
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
