"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Gamepad2, Gift, PartyPopper } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Event {
  id_evenement: number
  code_promo?: string
  titre: string
  description?: string
  type: 'promotion' | 'jeu' | 'evenement'
  type_remise?: 'pourcentage' | 'fixe' | 'point_bonus'
  valeur_remise?: number
  url_affiche?: string
  date_debut: string
  date_fin: string
  active: 'oui' | 'non'
  limite_utilisation?: number
  nombre_utilisation?: number
}

interface EventManagementProps {
  initialEvents?: Event[]
}

export function EventManagement({ initialEvents = [] }: EventManagementProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    type: "promotion" as 'promotion' | 'jeu' | 'evenement',
    code_promo: "",
    type_remise: "pourcentage" as 'pourcentage' | 'fixe' | 'point_bonus' | '',
    valeur_remise: "",
    url_affiche: "",
    affiche: null as File | null,
    date_debut: "",
    date_fin: "",
    limite_utilisation: "",
    active: "non" as 'oui' | 'non',
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8000/api/evenements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      if (Array.isArray(data)) {
        setEvents(data)
      } else if (data.data) {
        setEvents(Array.isArray(data.data) ? data.data : [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      titre: "",
      description: "",
      type: "promotion",
      code_promo: "",
      type_remise: "pourcentage",
      valeur_remise: "",
      url_affiche: "",
      affiche: null,
      date_debut: "",
      date_fin: "",
      limite_utilisation: "",
      active: "non",
    })
    setEditingEvent(null)
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      titre: event.titre,
      description: event.description || "",
      type: event.type,
      code_promo: event.code_promo || "",
      type_remise: event.type_remise || "pourcentage",
      valeur_remise: event.valeur_remise?.toString() || "",
      url_affiche: event.url_affiche || "",
      affiche: null,
      date_debut: event.date_debut,
      date_fin: event.date_fin,
      limite_utilisation: event.limite_utilisation?.toString() || "",
      active: event.active,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem('auth_token')
      const submitData = new FormData()

      // Ajouter les champs requis
      submitData.append('titre', formData.titre)
      submitData.append('type', formData.type)
      if (formData.description) submitData.append('description', formData.description)
      if (formData.code_promo) submitData.append('code_promo', formData.code_promo)
      if (formData.type_remise) submitData.append('type_remise', formData.type_remise)
      if (formData.valeur_remise) submitData.append('valeur_remise', formData.valeur_remise)
      if (formData.url_affiche && !formData.affiche) submitData.append('url_affiche', formData.url_affiche)
      if (formData.date_debut) submitData.append('date_debut', formData.date_debut)
      if (formData.date_fin) submitData.append('date_fin', formData.date_fin)
      if (formData.limite_utilisation) submitData.append('limite_utilisation', formData.limite_utilisation)
      submitData.append('active', formData.active)

      // Gérer l'upload de fichier
      if (formData.affiche) {
        submitData.append('affiche', formData.affiche)
      }

      const url = editingEvent
        ? `http://localhost:8000/api/evenements/${editingEvent.id_evenement}`
        : 'http://localhost:8000/api/evenements'

      const method = editingEvent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: submitData,
      })

      const data = await response.json()

      if (response.ok && data) {
        toast({
          title: editingEvent ? "Événement mis à jour" : "Événement créé",
          description: editingEvent ? "L'événement a été modifié avec succès" : "Le nouvel événement a été créé",
        })
        setIsDialogOpen(false)
        resetForm()
        fetchEvents()
      } else {
        throw new Error(data.message || 'Erreur lors de l\'enregistrement')
      }
    } catch (error: any) {
      console.error("Error saving event:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (eventId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/evenements/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        toast({
          title: "Événement supprimé",
          description: "L'événement a été retiré",
        })
        fetchEvents()
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      })
    }
  }

  const handleToggle = async (eventId: number, currentStatus: 'oui' | 'non') => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:8000/api/evenements/${eventId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data) {
        toast({
          title: currentStatus === 'oui' ? "Événement désactivé" : "Événement activé",
          description: currentStatus === 'oui' 
            ? "L'événement n'est plus visible pour les étudiants" 
            : "L'événement est maintenant visible pour les étudiants",
        })
        fetchEvents()
      } else {
        throw new Error('Erreur lors de la modification')
      }
    } catch (error) {
      console.error("Error toggling event:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification",
        variant: "destructive",
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'jeu':
        return <Gamepad2 className="h-4 w-4" />
      case 'promotion':
        return <Gift className="h-4 w-4" />
      case 'evenement':
        return <PartyPopper className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'jeu':
        return 'Jeu'
      case 'promotion':
        return 'Promotion'
      case 'evenement':
        return 'Événement'
      default:
        return type
    }
  }

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(event => event.type === filterType)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des événements</h2>
          <p className="text-muted-foreground">
            Gérez les jeux, promotions et événements. Les nouveaux événements sont créés <strong>inactifs</strong> par défaut.
            Configurez-les puis activez-les pour qu'ils deviennent visibles pour les étudiants.
          </p>
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
              Ajouter un événement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Modifier l'événement" : "Nouvel événement"}
              </DialogTitle>
              <DialogDescription>
                {editingEvent 
                  ? "Modifiez les informations de l'événement" 
                  : "Créez un nouvel événement (jeu, promotion ou événement)"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'promotion' | 'jeu' | 'evenement') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="jeu">Jeu</SelectItem>
                      <SelectItem value="evenement">Événement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code_promo">Code promo</Label>
                  <Input
                    id="code_promo"
                    value={formData.code_promo}
                    onChange={(e) => setFormData({ ...formData, code_promo: e.target.value })}
                    placeholder="BIENVENUE20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
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
                />
              </div>

              {formData.type === 'promotion' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type_remise">Type de remise</Label>
                    <Select
                      value={formData.type_remise}
                      onValueChange={(value: 'pourcentage' | 'fixe' | 'point_bonus') =>
                        setFormData({ ...formData, type_remise: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pourcentage">Pourcentage</SelectItem>
                        <SelectItem value="fixe">Montant fixe</SelectItem>
                        <SelectItem value="point_bonus">Points bonus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valeur_remise">Valeur de remise</Label>
                    <Input
                      id="valeur_remise"
                      type="number"
                      value={formData.valeur_remise}
                      onChange={(e) => setFormData({ ...formData, valeur_remise: e.target.value })}
                      placeholder="20"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_debut">Date de début</Label>
                  <Input
                    id="date_debut"
                    type="date"
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_fin">Date de fin *</Label>
                  <Input
                    id="date_fin"
                    type="date"
                    value={formData.date_fin}
                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limite_utilisation">
                  {formData.type === 'jeu' 
                    ? 'Parties max par jour (0 = illimité)' 
                    : 'Limite d\'utilisation (0 = illimité)'}
                </Label>
                <Input
                  id="limite_utilisation"
                  type="number"
                  value={formData.limite_utilisation}
                  onChange={(e) => setFormData({ ...formData, limite_utilisation: e.target.value })}
                  placeholder="0"
                  min="0"
                />
                {formData.type === 'jeu' && (
                  <p className="text-xs text-muted-foreground">
                    Pour les jeux, cela représente le nombre maximum de parties par jour par utilisateur (0 = illimité)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url_affiche">URL de l'affiche</Label>
                <Input
                  id="url_affiche"
                  value={formData.url_affiche}
                  onChange={(e) => setFormData({ ...formData, url_affiche: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiche">Ou uploader une image</Label>
                <Input
                  id="affiche"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setFormData({ ...formData, affiche: file })
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="active">Statut</Label>
                <Select
                  value={formData.active}
                  onValueChange={(value: 'oui' | 'non') =>
                    setFormData({ ...formData, active: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non">Inactif (non visible)</SelectItem>
                    <SelectItem value="oui">Actif (visible)</SelectItem>
                  </SelectContent>
                </Select>
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
                <Button type="submit" disabled={isLoading} className="bg-secondary text-white hover:bg-secondary-light">
                  {isLoading ? "Enregistrement..." : editingEvent ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
        >
          Tous
        </Button>
        <Button
          variant={filterType === 'promotion' ? 'default' : 'outline'}
          onClick={() => setFilterType('promotion')}
        >
          Promotions
        </Button>
        <Button
          variant={filterType === 'jeu' ? 'default' : 'outline'}
          onClick={() => setFilterType('jeu')}
        >
          Jeux
        </Button>
        <Button
          variant={filterType === 'evenement' ? 'default' : 'outline'}
          onClick={() => setFilterType('evenement')}
        >
          Événements
        </Button>
      </div>

      {/* Liste des événements */}
      {isLoading && events.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Chargement...</p>
          </CardContent>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucun événement</CardTitle>
            <CardDescription>Créez votre premier événement pour commencer</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id_evenement} className="overflow-hidden">
              <div className="aspect-[3/1] relative bg-muted">
                {event.url_affiche ? (
                  <img
                    src={event.url_affiche.startsWith('http') ? event.url_affiche : `http://localhost:8000${event.url_affiche}`}
                    alt={event.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getTypeIcon(event.type)}
                  </div>
                )}
                <Badge
                  className={`absolute top-2 right-2 ${
                    event.active === 'oui' ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  {event.active === 'oui' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(event.type)}
                  <Badge variant="outline">{getTypeLabel(event.type)}</Badge>
                </div>
                <CardTitle>{event.titre}</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  {event.code_promo && (
                    <div>Code: <span className="font-mono">{event.code_promo}</span></div>
                  )}
                  {event.valeur_remise && (
                    <div>
                      Remise: {event.valeur_remise}
                      {event.type_remise === 'pourcentage' ? '%' : ' FCFA'}
                    </div>
                  )}
                  <div>Du {new Date(event.date_debut).toLocaleDateString('fr-FR')} au {new Date(event.date_fin).toLocaleDateString('fr-FR')}</div>
                  {(event.limite_utilisation ?? 0) > 0 && (
                    <div>
                      {event.type === 'jeu' 
                        ? `Parties max/jour: ${event.limite_utilisation}` 
                        : `Utilisations: ${event.nombre_utilisation || 0} / ${event.limite_utilisation}`}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(event)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggle(event.id_evenement, event.active)}
                    className="flex-1"
                  >
                    {event.active === 'oui' ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Activer
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive flex-1"
                    onClick={() => handleDelete(event.id_evenement)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

