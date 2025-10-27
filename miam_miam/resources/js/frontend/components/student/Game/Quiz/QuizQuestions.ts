// Banque de 50 questions sur la cuisine camerounaise et congolaise
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const questionBank: Question[] = [
  {
    id: 1,
    question: "Quel est le plat national du Cameroun ?",
    options: ["Poulet DG", "Ndolé", "Koki", "Achu"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Le ndolé est préparé avec quelle feuille ?",
    options: ["Feuille de manioc", "Feuille de vernonia", "Feuille de patate", "Feuille de gombo"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "Que signifie 'DG' dans Poulet DG ?",
    options: ["Directeur Général", "Délicieux Grillé", "Doux et Gras", "Douala Gourmet"],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "Le koki est fait à base de quoi ?",
    options: ["Haricots rouges", "Maïs", "Manioc", "Igname"],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "Quel est l'ingrédient principal de l'eru ?",
    options: ["Feuilles d'okok", "Feuilles d'eru (gnetum)", "Feuilles de manioc", "Épinards"],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "Le achu soup est originaire de quelle région du Cameroun ?",
    options: ["Littoral", "Nord", "Nord-Ouest", "Sud"],
    correctAnswer: 2
  },
  {
    id: 7,
    question: "Avec quoi mange-t-on traditionnellement le ndolé ?",
    options: ["Pain", "Riz", "Miondo/Bâton de manioc", "Couscous"],
    correctAnswer: 2
  },
  {
    id: 8,
    question: "Le sanga est un mélange de quoi ?",
    options: ["Maïs et haricots", "Riz et poisson", "Manioc et arachide", "Plantain et viande"],
    correctAnswer: 0
  },
  {
    id: 9,
    question: "Quelle est la boisson traditionnelle camerounaise à base de maïs ?",
    options: ["Bissap", "Piment", "Bil-bil", "Matango"],
    correctAnswer: 2
  },
  {
    id: 10,
    question: "Le kondré est un plat à base de ?",
    options: ["Plantain", "Igname", "Manioc", "Patate douce"],
    correctAnswer: 0
  },
  {
    id: 11,
    question: "Le water fufu est fait à base de ?",
    options: ["Farine de manioc", "Farine de maïs", "Farine de blé", "Farine d'igname"],
    correctAnswer: 1
  },
  {
    id: 12,
    question: "Quel plat congolais est fait avec des feuilles de manioc ?",
    options: ["Saka-saka", "Moambe", "Liboke", "Chikwanga"],
    correctAnswer: 0
  },
  {
    id: 13,
    question: "Le moambe chicken est cuisiné avec quelle sauce ?",
    options: ["Sauce tomate", "Sauce arachide", "Sauce noix de palme", "Sauce gombo"],
    correctAnswer: 2
  },
  {
    id: 14,
    question: "Le liboke est un mode de cuisson qui utilise ?",
    options: ["Four", "Feuilles de bananier", "Marmite en terre", "Grill"],
    correctAnswer: 1
  },
  {
    id: 15,
    question: "Le chikwanga est fait à base de ?",
    options: ["Maïs", "Manioc", "Riz", "Igname"],
    correctAnswer: 1
  },
  {
    id: 16,
    question: "Quel poisson est populaire dans la cuisine camerounaise ?",
    options: ["Saumon", "Machoiron", "Thon", "Carpe"],
    correctAnswer: 1
  },
  {
    id: 17,
    question: "Le puff-puff est un beignet à base de ?",
    options: ["Farine de blé", "Farine de manioc", "Farine de maïs", "Farine de riz"],
    correctAnswer: 0
  },
  {
    id: 18,
    question: "Le kwacoco est fait avec ?",
    options: ["Banane plantain", "Taro/Macabo", "Manioc", "Igname"],
    correctAnswer: 1
  },
  {
    id: 19,
    question: "Le suya est quel type de plat ?",
    options: ["Soupe", "Brochettes épicées", "Ragoût", "Salade"],
    correctAnswer: 1
  },
  {
    id: 20,
    question: "Quel est l'accompagnement principal du poulet moambe ?",
    options: ["Pain", "Riz", "Fufu", "Couscous"],
    correctAnswer: 2
  },
  {
    id: 21,
    question: "Le mbongo tchobi est une sauce de quelle couleur ?",
    options: ["Rouge", "Verte", "Noire", "Jaune"],
    correctAnswer: 2
  },
  {
    id: 22,
    question: "Le kanda ti nyama est un plat à base de ?",
    options: ["Poulet", "Bœuf", "Poisson", "Chèvre"],
    correctAnswer: 1
  },
  {
    id: 23,
    question: "Le bobolo est fait à partir de ?",
    options: ["Maïs fermenté", "Manioc fermenté", "Riz fermenté", "Mil fermenté"],
    correctAnswer: 1
  },
  {
    id: 24,
    question: "Quel légume est essentiel dans le koki corn ?",
    options: ["Tomate", "Oignon", "Piment", "Maïs"],
    correctAnswer: 3
  },
  {
    id: 25,
    question: "Le ekwang est enroulé dans quelles feuilles ?",
    options: ["Feuilles de bananier", "Feuilles de manioc", "Feuilles de taro", "Feuilles de maïs"],
    correctAnswer: 2
  },
  {
    id: 26,
    question: "Quelle huile est traditionnellement utilisée dans la cuisine camerounaise ?",
    options: ["Huile d'olive", "Huile d'arachide", "Huile de palme", "Huile de tournesol"],
    correctAnswer: 2
  },
  {
    id: 27,
    question: "Le pondu est un autre nom pour ?",
    options: ["Saka-saka", "Moambe", "Fufu", "Chikwanga"],
    correctAnswer: 0
  },
  {
    id: 28,
    question: "Quel est l'ingrédient principal du makemba ?",
    options: ["Banane plantain", "Manioc", "Igname", "Patate douce"],
    correctAnswer: 0
  },
  {
    id: 29,
    question: "Le ntaba est un plat à base de ?",
    options: ["Poulet", "Chèvre", "Bœuf", "Poisson"],
    correctAnswer: 1
  },
  {
    id: 30,
    question: "Quelle feuille est utilisée dans l'okok ?",
    options: ["Feuille de vernonia", "Feuille de manioc", "Feuille de gnetum", "Feuille de baobab"],
    correctAnswer: 2
  },
  {
    id: 31,
    question: "Le fumbwa est un plat à base de ?",
    options: ["Feuilles sauvages", "Viande fumée", "Poisson séché", "Champignons"],
    correctAnswer: 0
  },
  {
    id: 32,
    question: "Quel poisson est utilisé dans le liboke de poisson ?",
    options: ["Capitaine", "Tilapia", "Saumon", "Tous ces poissons"],
    correctAnswer: 3
  },
  {
    id: 33,
    question: "Le mpiodi est une sauce à base de ?",
    options: ["Arachide", "Graines de courge", "Sésame", "Noix de cajou"],
    correctAnswer: 1
  },
  {
    id: 34,
    question: "Quel est l'ingrédient principal du kwem ?",
    options: ["Maïs", "Manioc", "Igname pilée", "Riz"],
    correctAnswer: 2
  },
  {
    id: 35,
    question: "Le nkui est un condiment à base de ?",
    options: ["Piment", "Graines de courge", "Arachide", "Sésame"],
    correctAnswer: 1
  },
  {
    id: 36,
    question: "Quel plat camerounais est cuit à la vapeur dans des feuilles ?",
    options: ["Koki", "Ndolé", "Poulet DG", "Sanga"],
    correctAnswer: 0
  },
  {
    id: 37,
    question: "Le safou est quel type d'aliment ?",
    options: ["Légume", "Fruit", "Tubercule", "Céréale"],
    correctAnswer: 1
  },
  {
    id: 38,
    question: "Quelle viande est utilisée dans le nkui sauce ?",
    options: ["Bœuf", "Chèvre", "Poulet", "Toutes ces viandes"],
    correctAnswer: 3
  },
  {
    id: 39,
    question: "Le kelen-kelen vient de quelle région ?",
    options: ["Cameroun", "Congo", "Gabon", "RDC"],
    correctAnswer: 1
  },
  {
    id: 40,
    question: "Quel est l'ingrédient principal du sangah ?",
    options: ["Maïs et haricots", "Riz et poisson", "Manioc et viande", "Plantain et arachide"],
    correctAnswer: 0
  },
  {
    id: 41,
    question: "Le kpwem est fait à base de ?",
    options: ["Banane plantain pilée", "Manioc pilé", "Igname pilée", "Maïs pilé"],
    correctAnswer: 2
  },
  {
    id: 42,
    question: "Quelle boisson est faite à partir de gingembre au Cameroun ?",
    options: ["Bissap", "Tangawis", "Matango", "Kossam"],
    correctAnswer: 1
  },
  {
    id: 43,
    question: "Le akara est fait avec ?",
    options: ["Farine de blé", "Pâte de haricots", "Farine de mil", "Farine de maïs"],
    correctAnswer: 1
  },
  {
    id: 44,
    question: "Quel condiment piquant est populaire au Cameroun ?",
    options: ["Harissa", "Pebe", "Tabasco", "Sambal"],
    correctAnswer: 1
  },
  {
    id: 45,
    question: "Le sauce jaune tire sa couleur de ?",
    options: ["Safran", "Curcuma", "Huile de palme", "Piment jaune"],
    correctAnswer: 2
  },
  {
    id: 46,
    question: "Quel tubercule est le plus utilisé dans la cuisine camerounaise ?",
    options: ["Pomme de terre", "Manioc", "Patate douce", "Igname"],
    correctAnswer: 3
  },
  {
    id: 47,
    question: "Le folon est un plat à base de ?",
    options: ["Riz", "Feuilles de taro", "Mil", "Couscous"],
    correctAnswer: 1
  },
  {
    id: 48,
    question: "Quelle partie du poulet est utilisée dans le poulet braisé ?",
    options: ["Cuisses", "Ailes", "Blanc", "Poulet entier"],
    correctAnswer: 3
  },
  {
    id: 49,
    question: "Le mikate est quel type de préparation ?",
    options: ["Soupe", "Beignet", "Ragoût", "Salade"],
    correctAnswer: 1
  },
  {
    id: 50,
    question: "Quel fruit est utilisé dans le jus de bissap camerounais ?",
    options: ["Mangue", "Tamarin", "Fleur d'hibiscus", "Goyave"],
    correctAnswer: 2
  }
];

// Fonction pour sélectionner 10 questions aléatoires
export const getRandomQuestions = (count: number = 10): Question[] => {
  const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
