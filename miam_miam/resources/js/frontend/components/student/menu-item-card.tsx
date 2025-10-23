"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

interface MenuItemCardProps {
  item: any
  onAddToCart: (item: any) => void
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <img
          src={item.image || "/placeholder.svg?height=200&width=300"}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.isSpecial && <Badge className="absolute top-3 right-3 bg-primary text-secondary">Spécial</Badge>}
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{item.name}</CardTitle>
        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">{(item.price / 100).toFixed(0)}F</span>
          <Button
            size="sm"
            onClick={() => onAddToCart(item)}
            className="bg-secondary text-white hover:bg-secondary-light"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
