export type UserRole = "student" | "employee" | "manager" | "admin"

export interface User {
  id: string
  email: string
  name: string
  phone: string
  location: string
  role: UserRole
  loyaltyPoints: number
  referralCode: string
  createdAt: Date
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  available: boolean
  isSpecial?: boolean
}

export interface CartItem extends MenuItem {
  quantity: number
}

export type OrderType = "delivery" | "pickup"
export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled"

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  type: OrderType
  deliveryAddress?: string
  pickupTime?: string
  status: OrderStatus
  pointsUsed: number
  pointsEarned: number
  comment?: string
  createdAt: Date
  completedAt?: Date
}

export interface Complaint {
  id: string
  userId: string
  orderId: string
  message: string
  status: "pending" | "resolved"
  response?: string
  createdAt: Date
}

export interface Promotion {
  id: string
  title: string
  description: string
  image: string
  startDate: Date
  endDate: Date
  active: boolean
}

export interface TopCustomer {
  userId: string
  name: string
  totalSpent: number
  orderCount: number
  rank: number
}
