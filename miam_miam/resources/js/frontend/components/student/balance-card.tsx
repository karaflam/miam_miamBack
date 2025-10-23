"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Plus } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface BalanceCardProps {
  balance: number
  onBalanceUpdate: (newBalance: number) => void
}

export function BalanceCard({ balance, onBalanceUpdate }: BalanceCardProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRecharge = async () => {
    const rechargeAmount = Number.parseInt(amount) * 100
    if (!rechargeAmount || rechargeAmount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const supabase = createBrowserClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        })
        return
      }

      const newBalance = balance + rechargeAmount

      const { error } = await supabase.from("balances").update({ amount: newBalance }).eq("userId", user.id)

      if (error) throw error

      // Create transaction record
      await supabase.from("transactions").insert({
        userId: user.id,
        amount: rechargeAmount,
        type: "recharge",
        description: "Rechargement de compte",
      })

      toast({
        title: "Rechargement réussi",
        description: `Votre compte a été crédité de ${amount}F`,
      })

      onBalanceUpdate(newBalance)
      setAmount("")
      router.refresh()
    } catch (error) {
      console.error("Error recharging balance:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rechargement",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Solde
        </CardTitle>
        <CardDescription>Gérez votre compte</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-6 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Solde actuel</p>
          <p className="text-4xl font-bold text-primary">{(balance / 100).toFixed(0)}F</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="recharge-amount">Montant à recharger (F)</Label>
          <Input
            id="recharge-amount"
            type="number"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
          />
          <Button className="w-full" onClick={handleRecharge} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            {isLoading ? "Rechargement..." : "Recharger"}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[500, 1000, 2000].map((preset) => (
            <Button key={preset} variant="outline" size="sm" onClick={() => setAmount(preset.toString())}>
              {preset}F
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
