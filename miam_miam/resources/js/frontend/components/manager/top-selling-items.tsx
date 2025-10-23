"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface TopSellingItemsProps {
  items: any[]
}

export function TopSellingItems({ items }: TopSellingItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Articles les plus vendus
        </CardTitle>
        <CardDescription>Top 5 des meilleures ventes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-surface rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-secondary font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.total_quantity} vendus</p>
              </div>
              <span className="font-bold text-primary">{((item.total_revenue || 0) / 100).toFixed(0)}F</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
