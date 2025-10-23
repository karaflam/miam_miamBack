import type { MenuItem, Promotion, TopCustomer } from "./types"

export const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Burger Classique",
    description: "Pain brioché, steak haché, cheddar, salade, tomate, oignons",
    price: 8500,
    category: "Burgers",
    image: "/classic-burger.png",
    available: true,
    isSpecial: true,
  },
  {
    id: "2",
    name: "Pizza Margherita",
    description: "Sauce tomate, mozzarella, basilic frais",
    price: 7000,
    category: "Pizzas",
    image: "/margherita-pizza.png",
    available: true,
  },
  {
    id: "3",
    name: "Salade César",
    description: "Laitue romaine, poulet grillé, parmesan, croûtons, sauce césar",
    price: 6500,
    category: "Salades",
    image: "/caesar-salad.png",
    available: true,
  },
  {
    id: "4",
    name: "Pâtes Carbonara",
    description: "Spaghetti, lardons, crème, parmesan, jaune d'œuf",
    price: 7500,
    category: "Pâtes",
    image: "/classic-carbonara.png",
    available: false,
  },
  {
    id: "5",
    name: "Tacos Poulet",
    description: "Tortilla, poulet mariné, fromage, sauce fromagère, frites",
    price: 6000,
    category: "Tacos",
    image: "/chicken-tacos.png",
    available: true,
  },
  {
    id: "6",
    name: "Sushi Mix",
    description: "Assortiment de 12 pièces: saumon, thon, california",
    price: 12000,
    category: "Sushi",
    image: "/sushi-platter.png",
    available: true,
    isSpecial: true,
  },
]

export const mockPromotions: Promotion[] = [
  {
    id: "1",
    title: "🎉 Happy Hour",
    description: "-20% sur tous les burgers de 17h à 19h",
    image: "/happy-hour-promotion.jpg",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    active: true,
  },
  {
    id: "2",
    title: "🎮 Gaming Night",
    description: "Participez à notre tournoi FIFA ce vendredi!",
    image: "/gaming-tournament.png",
    startDate: new Date(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    active: true,
  },
]

export const mockTopCustomers: TopCustomer[] = [
  { userId: "1", name: "Marie Dubois", totalSpent: 125000, orderCount: 45, rank: 1 },
  { userId: "2", name: "Pierre Martin", totalSpent: 98000, orderCount: 38, rank: 2 },
  { userId: "3", name: "Sophie Bernard", totalSpent: 87500, orderCount: 32, rank: 3 },
  { userId: "4", name: "Lucas Petit", totalSpent: 76000, orderCount: 28, rank: 4 },
  { userId: "5", name: "Emma Durand", totalSpent: 68500, orderCount: 25, rank: 5 },
  { userId: "6", name: "Thomas Robert", totalSpent: 62000, orderCount: 23, rank: 6 },
  { userId: "7", name: "Léa Moreau", totalSpent: 58000, orderCount: 21, rank: 7 },
  { userId: "8", name: "Hugo Simon", totalSpent: 54500, orderCount: 19, rank: 8 },
  { userId: "9", name: "Chloé Laurent", totalSpent: 51000, orderCount: 18, rank: 9 },
  { userId: "10", name: "Nathan Lefebvre", totalSpent: 48000, orderCount: 17, rank: 10 },
]
