export const categories = [
  "Semences cereales",
  "Semences legumineuses",
  "Pomme de terre",
  "Betterave a sucre",
  "Engrais de fond",
  "Engrais de couverture",
];

export const products = [
  {
    id: 1,
    slug: "ble-tendre-anza",
    name: "Ble tendre Anza",
    reference: "BT-ANZ-001",
    category: "Semences cereales",
    image: "/internet-products/wheat-field.jpg",
    price: 295,
    stock: 48,
    unit: "Sac 100 kg",
    summary: "Semence de ble tendre certifiee pour les campagnes cerealiere.",
    description:
      "Reference de ble tendre adaptee aux exploitations qui recherchent une semence reguliere, disponible et facile a integrer a leurs achats.",
    benefits: [
      "Semence certifiee pour les campagnes cerealiere",
      "Reference suivie en stock et en commande",
      "Reference phare pour la campagne agricole",
    ],
    receptionModes: ["Livraison", "Retrait en centre"],
    featured: true,
  },
  {
    id: 2,
    slug: "ble-dur-karim",
    name: "Ble dur Karim",
    reference: "BD-KRM-014",
    category: "Semences cereales",
    image: "/internet-products/wheat-field.jpg",
    price: 325,
    stock: 32,
    unit: "Sac 100 kg",
    summary: "Semence de ble dur pour diversifier la gamme cerealiere.",
    description:
      "Variete de ble dur adaptee a une offre cerealiere complete avec son propre prix, son stock et ses modes de reception.",
    benefits: [
      "Variation claire entre ble tendre et ble dur",
      "Reference facile a suivre en gestion",
      "Produit simple a retrouver par categorie",
    ],
    receptionModes: ["Livraison", "Retrait en centre"],
  },
  {
    id: 3,
    slug: "orge-amira",
    name: "Orge Amira",
    reference: "OR-AMR-021",
    category: "Semences cereales",
    image: "/internet-products/barley-field.jpg",
    price: 255,
    stock: 15,
    unit: "Sac 100 kg",
    summary: "Semence d orge pour completer la famille des cereales.",
    description:
      "Semence d orge adaptee aux besoins des exploitations qui souhaitent completer leur approvisionnement en cereales.",
    benefits: [
      "Categorie cereales clairement identifiee",
      "Produit ideal pour un cas de stock faible",
      "Reference pratique pour le suivi des stocks",
    ],
    receptionModes: ["Retrait en centre"],
    featured: true,
  },
  {
    id: 4,
    slug: "feve-legumineuse-selection",
    name: "Feve selection",
    reference: "LEG-FEV-034",
    category: "Semences legumineuses",
    image: "/internet-products/field-beans.jpg",
    price: 410,
    stock: 19,
    unit: "Sac 100 kg",
    summary: "Semence legumineuse pour les exploitations orientees legumes secs.",
    description:
      "Produit destine aux exploitations qui souhaitent diversifier leurs cultures au dela des cereales.",
    benefits: [
      "Diversifie l offre de semences",
      "Recherche simple par categorie",
      "Reference claire pour les achats saisonniers",
    ],
    receptionModes: ["Livraison", "Retrait en centre"],
  },
  {
    id: 5,
    slug: "pomme-de-terre-certifiee",
    name: "Pomme de terre certifiee",
    reference: "PDT-CER-052",
    category: "Pomme de terre",
    image: "/internet-products/potato-field.jpg",
    price: 185,
    stock: 22,
    unit: "Sac 25 kg",
    summary: "Reference de pomme de terre certifiee pour les campagnes specialisees.",
    description:
      "Reference de pomme de terre avec un conditionnement specifique pour les besoins des cultures specialisees.",
    benefits: [
      "Categorie specialisee clairement separee",
      "Conditionnement distinct des cereales",
      "Produit utile pour les paniers et commandes",
    ],
    receptionModes: ["Livraison", "Retrait en centre"],
    featured: true,
  },
  {
    id: 6,
    slug: "betterave-a-sucre-monogerme",
    name: "Betterave a sucre monogerme",
    reference: "BTS-MON-061",
    category: "Betterave a sucre",
    image: "/internet-products/sugar-beet-field.jpg",
    price: 540,
    stock: 54,
    unit: "Unite de semence",
    summary: "Semence de betterave a sucre pour les besoins de cultures dediees.",
    description:
      "Produit adapte aux besoins de la betterave a sucre avec un conditionnement et une unite de vente propres a cette famille.",
    benefits: [
      "Famille de produit specifique",
      "Reference adaptee a une fiche detail complete",
      "Stock confortable pour les scenarios positifs",
    ],
    receptionModes: ["Livraison", "Retrait en centre"],
    featured: true,
  },
  {
    id: 7,
    slug: "engrais-npk-16-16-20",
    name: "Engrais NPK 16-16-20",
    reference: "ENF-NPK-1620",
    category: "Engrais de fond",
    image: "/internet-products/fertilizer-granules.jpg",
    price: 430,
    stock: 27,
    unit: "Sac 50 kg",
    summary: "Engrais de fond pour preparer le sol avant la campagne.",
    description:
      "Produit de base pour la fertilisation du sol, avec une composition reconnue et un conditionnement adapte au terrain.",
    benefits: [
      "Famille engrais de fond clairement identifiee",
      "Composition facile a reconnaitre",
      "Convient aux ecrans de gestion de stock",
    ],
    receptionModes: ["Retrait en centre"],
    featured: true,
  },
  {
    id: 8,
    slug: "engrais-map-11-52-00",
    name: "Engrais MAP 11-52-00",
    reference: "ENF-MAP-1152",
    category: "Engrais de fond",
    image: "/internet-products/fertilizer-granules.jpg",
    price: 455,
    stock: 12,
    unit: "Sac 50 kg",
    summary: "Engrais technique pour les besoins de fertilisation de fond.",
    description:
      "Reference plus specialisee pour les exploitations qui recherchent une formulation adaptee aux besoins du sol.",
    benefits: [
      "Composition lisible pour les fiches produit",
      "Excellent cas pour une alerte de stock faible",
      "Reference utile pour les suivis de stock",
    ],
    receptionModes: ["Retrait en centre"],
  },
  {
    id: 9,
    slug: "uree-46",
    name: "Uree 46%",
    reference: "ENC-URE-4600",
    category: "Engrais de couverture",
    image: "/internet-products/fertilizer-granules.jpg",
    price: 395,
    stock: 39,
    unit: "Sac 50 kg",
    summary: "Engrais de couverture classique pour accompagner la croissance des cultures.",
    description:
      "Produit simple et reconnu pour les besoins courants de couverture sur plusieurs types de cultures.",
    benefits: [
      "Nom facile a reconnaitre par les clients",
      "Bonne reference pour les tableaux de stock",
      "Produit classique du catalogue engrais",
    ],
    receptionModes: ["Retrait en centre"],
  },
  {
    id: 10,
    slug: "ammonitrate-33-5",
    name: "Ammonitrate 33.5%",
    reference: "ENC-AMN-3350",
    category: "Engrais de couverture",
    image: "/internet-products/fertilizer-granules.jpg",
    price: 405,
    stock: 18,
    unit: "Sac 50 kg",
    summary: "Reference de couverture pour completer la famille uree et sulfate.",
    description:
      "Ce produit complete la gamme d engrais de couverture avec une formule adaptee aux besoins de terrain.",
    benefits: [
      "Complete la famille engrais de couverture",
      "Reference utile pour les suivis gestionnaire",
      "Bon exemple pour les validations internes",
    ],
    receptionModes: ["Retrait en centre"],
  },
];

export const dashboardStats = [
  { label: "Produits actifs", value: "126", detail: "Catalogue centralise" },
  { label: "Commandes du mois", value: "84", detail: "Suivi gestionnaire" },
  { label: "Clients inscrits", value: "312", detail: "Espace client actif" },
  { label: "Stocks faibles", value: "09", detail: "Alertes a traiter" },
];

export const storefrontCollections = [
  {
    title: "Cereales",
    description:
      "Ble tendre, ble dur et orge pour les campagnes agricoles et les besoins de production.",
    image: "/internet-products/wheat-field.jpg",
    href: "/catalogue",
    count: "24 references",
  },
  {
    title: "Cultures specialisees",
    description:
      "Legumineuses, pomme de terre et betterave a sucre pour des besoins de culture plus specifiques.",
    image: "/internet-products/potato-field.jpg",
    href: "/catalogue",
    count: "18 references",
  },
  {
    title: "Engrais",
    description:
      "Engrais de fond et de couverture pour accompagner la preparation du sol et le suivi des cultures.",
    image: "/internet-products/fertilizer-granules.jpg",
    href: "/catalogue",
    count: "11 references",
  },
];

export const serviceHighlights = [
  {
    title: "Catalogue accessible",
    description:
      "Le visiteur consulte les produits sans authentification et retrouve rapidement les familles disponibles.",
  },
  {
    title: "Commande simplifiee",
    description:
      "Le client suit un parcours simple entre fiche produit, panier, commande, paiement et facture.",
  },
  {
    title: "Gestion centralisee",
    description:
      "Le gestionnaire retrouve le stock, les commandes, les paiements et les validations dans la meme plateforme.",
  },
  {
    title: "Suivi centralise",
    description:
      "Les equipes internes retrouvent commandes, paiements et validations au meme endroit.",
  },
];

export const catalogueAssurances = [
  "Prix affiches en MAD",
  "Produits organises par famille",
  "Consultation publique sans compte",
  "Retrait en centre ou livraison",
];

export const operationsPreview = [
  {
    id: "OP-203",
    type: "Validation commande",
    target: "CMD-2026-018",
    priority: "Haute",
  },
  {
    id: "OP-204",
    type: "Sortie de stock",
    target: "ENF-MAP-1152",
    priority: "Moyenne",
  },
  {
    id: "OP-205",
    type: "Confirmation paiement",
    target: "PAY-2026-044",
    priority: "Normale",
  },
];

export const customerOverview = [
  { label: "Commandes actives", value: "03", detail: "suivi en cours" },
  { label: "Factures", value: "06", detail: "documents disponibles" },
  { label: "Panier", value: "04", detail: "articles prepares" },
  { label: "Montant cumule", value: "8 420 MAD", detail: "historique client" },
];

export const customerOrders = [
  {
    number: "CMD-2026-041",
    date: "18 juillet 2026",
    status: "En preparation",
    amount: "1 960 MAD",
    items: "Ble tendre Anza, Uree 46%",
  },
  {
    number: "CMD-2026-036",
    date: "12 juillet 2026",
    status: "Prete au retrait",
    amount: "2 145 MAD",
    items: "Pomme de terre certifiee, Engrais MAP 11-52-00",
  },
  {
    number: "CMD-2026-028",
    date: "03 juillet 2026",
    status: "Livree",
    amount: "1 280 MAD",
    items: "Orge Amira, Feve selection",
  },
];

export const customerCart = [
  {
    name: "Ble tendre Anza",
    quantity: 2,
    unit: "Sac 100 kg",
    amount: "590 MAD",
  },
  {
    name: "Engrais NPK 16-16-20",
    quantity: 3,
    unit: "Sac 50 kg",
    amount: "1 290 MAD",
  },
  {
    name: "Pomme de terre certifiee",
    quantity: 4,
    unit: "Sac 25 kg",
    amount: "740 MAD",
  },
];

export const customerInvoices = [
  {
    number: "FAC-2026-092",
    order: "CMD-2026-036",
    date: "12 juillet 2026",
    amount: "2 145 MAD",
    payment: "Paye",
  },
  {
    number: "FAC-2026-076",
    order: "CMD-2026-028",
    date: "03 juillet 2026",
    amount: "1 280 MAD",
    payment: "Paye",
  },
  {
    number: "FAC-2026-061",
    order: "CMD-2026-021",
    date: "25 juin 2026",
    amount: "3 080 MAD",
    payment: "Partiel",
  },
];

export const managerOverview = [
  { label: "Commandes a traiter", value: "14", detail: "journee en cours" },
  { label: "Stocks faibles", value: "05", detail: "produits sensibles" },
  { label: "Paiements en attente", value: "07", detail: "a confirmer" },
  { label: "Factures du mois", value: "48", detail: "generees" },
];

export const managerProductRows = [
  {
    reference: "BT-ANZ-001",
    name: "Ble tendre Anza",
    category: "Semences cereales",
    stock: "48",
    price: "295 MAD",
  },
  {
    reference: "PDT-CER-052",
    name: "Pomme de terre certifiee",
    category: "Pomme de terre",
    stock: "22",
    price: "185 MAD",
  },
  {
    reference: "ENF-MAP-1152",
    name: "Engrais MAP 11-52-00",
    category: "Engrais de fond",
    stock: "12",
    price: "455 MAD",
  },
  {
    reference: "ENC-AMN-3350",
    name: "Ammonitrate 33.5%",
    category: "Engrais de couverture",
    stock: "18",
    price: "405 MAD",
  },
];

export const stockAlerts = [
  {
    product: "Engrais MAP 11-52-00",
    level: "12 sacs",
    status: "A reapprovisionner",
  },
  {
    product: "Orge Amira",
    level: "15 sacs",
    status: "Surveillance",
  },
  {
    product: "Feve selection",
    level: "19 sacs",
    status: "Surveillance",
  },
];

export const stockMovements = [
  {
    ref: "MOV-301",
    product: "Ble tendre Anza",
    type: "Entree",
    quantity: "+20",
    date: "20 juillet 2026",
  },
  {
    ref: "MOV-302",
    product: "Engrais MAP 11-52-00",
    type: "Sortie",
    quantity: "-05",
    date: "20 juillet 2026",
  },
  {
    ref: "MOV-303",
    product: "Pomme de terre certifiee",
    type: "Reservation",
    quantity: "-04",
    date: "19 juillet 2026",
  },
];

export const managerOrders = [
  {
    number: "CMD-2026-041",
    client: "Ferme Atlas",
    status: "En preparation",
    payment: "Attente",
    amount: "1 960 MAD",
  },
  {
    number: "CMD-2026-042",
    client: "Cooperative Al Amal",
    status: "Validation requise",
    payment: "Partiel",
    amount: "4 320 MAD",
  },
  {
    number: "CMD-2026-043",
    client: "Agriculteur Zemmouri",
    status: "Prete au retrait",
    payment: "Paye",
    amount: "980 MAD",
  },
];

export const paymentRecords = [
  {
    reference: "PAY-2026-044",
    client: "Ferme Atlas",
    method: "Virement",
    amount: "1 960 MAD",
    status: "A confirmer",
  },
  {
    reference: "PAY-2026-045",
    client: "Cooperative Al Amal",
    method: "Especes",
    amount: "2 000 MAD",
    status: "Partiel",
  },
  {
    reference: "PAY-2026-046",
    client: "Agriculteur Zemmouri",
    method: "Carte",
    amount: "980 MAD",
    status: "Valide",
  },
];

export const responsibilityOverview = [
  { label: "Demandes a valider", value: "08", detail: "file active" },
  { label: "Refus du mois", value: "03", detail: "avec motif" },
  { label: "Alertes stock", value: "05", detail: "controle rapide" },
  { label: "Montants sensibles", value: "12 640 MAD", detail: "sous revue" },
];

export const validationQueue = [
  {
    ref: "VAL-2026-081",
    object: "Commande CMD-2026-042",
    reason: "Montant eleve et stock limite",
    requester: "Gestionnaire principal",
    priority: "Haute",
  },
  {
    ref: "VAL-2026-082",
    object: "Paiement PAY-2026-045",
    reason: "Paiement partiel a verifier",
    requester: "Caissier",
    priority: "Moyenne",
  },
  {
    ref: "VAL-2026-083",
    object: "Sortie de stock MOV-302",
    reason: "Produit proche du seuil critique",
    requester: "Magasinier",
    priority: "Normale",
  },
];

export const adminOverview = [
  { label: "Utilisateurs actifs", value: "26", detail: "comptes valides" },
  { label: "Roles geres", value: "05", detail: "droits distincts" },
  { label: "Comptes a activer", value: "04", detail: "attente admin" },
  { label: "Sessions du jour", value: "19", detail: "acces controles" },
];

export const adminUsers = [
  {
    name: "Salma Bennani",
    role: "ADMIN",
    email: "salma@sonacos.ma",
    status: "Actif",
  },
  {
    name: "Youssef Alaoui",
    role: "GESTIONNAIRE",
    email: "youssef@sonacos.ma",
    status: "Actif",
  },
  {
    name: "Nadia Idrissi",
    role: "RESPONSABLE",
    email: "nadia@sonacos.ma",
    status: "Actif",
  },
  {
    name: "Hicham Tazi",
    role: "CLIENT",
    email: "hicham@gmail.com",
    status: "A activer",
  },
];

export const roleMatrix = [
  {
    role: "ADMIN",
    access: "Comptes, roles, activation, supervision",
  },
  {
    role: "GESTIONNAIRE",
    access: "Produits, stock, commandes, paiements, factures",
  },
  {
    role: "RESPONSABLE",
    access: "Validations, refus motives, tableau de bord",
  },
  {
    role: "CLIENT",
    access: "Panier, commandes, factures, profil",
  },
  {
    role: "VISITEUR",
    access: "Catalogue public et fiche produit",
  },
];
