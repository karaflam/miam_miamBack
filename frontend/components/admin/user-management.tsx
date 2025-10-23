"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Search } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface UserManagementProps {
  users: any[]
}

const roleConfig = {
  student: { label: "Étudiant", color: "bg-blue-500 text-white" },
  employee: { label: "Employé", color: "bg-green-500 text-white" },
  manager: { label: "Manager", color: "bg-purple-500 text-white" },
  admin: { label: "Admin", color: "bg-red-500 text-white" },
}

export function UserManagement({ users: initialUsers }: UserManagementProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleEditRole = (user: any) => {
    setEditingUser(user)
    setNewRole(user.role)
    setIsDialogOpen(true)
  }

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return

    const supabase = createBrowserClient()

    try {
      const { error } = await supabase.from("users").update({ role: newRole }).eq("id", editingUser.id)

      if (error) throw error

      setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? { ...user, role: newRole } : user)))

      toast({
        title: "Rôle mis à jour",
        description: `Le rôle de ${editingUser.fullName} a été modifié`,
      })

      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des utilisateurs</CardTitle>
          <CardDescription>Gérez les rôles et les permissions des utilisateurs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="student">Étudiants</SelectItem>
                <SelectItem value="employee">Employés</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Rôle</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Inscription</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => {
                    const role = roleConfig[user.role as keyof typeof roleConfig]
                    return (
                      <tr key={user.id} className={index % 2 === 0 ? "bg-background" : "bg-surface"}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{user.fullName}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <Badge className={role.color}>{role.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(new Date(user.createdAt), "PP", { locale: fr })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleEditRole(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredUsers.length} utilisateur(s) affiché(s) sur {users.length} total
          </p>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>Changez le rôle de {editingUser?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nouveau rôle</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Étudiant</SelectItem>
                  <SelectItem value="employee">Employé</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateRole} className="bg-secondary text-white hover:bg-secondary-light">
                Mettre à jour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
