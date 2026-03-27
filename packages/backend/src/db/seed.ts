import { db } from "./index";
import { categories, products } from "./schema";

const seedCategories = [
  {
    description: "Fájdalom és kellemetlenség enyhítésére szolgáló természetes kenőcsök",
    name: "Fájdalomcsillapító",
    slug: "fajdalomcsillapito",
    sortOrder: 1,
  },
  {
    description: "Bőr ápolására és regenerálására készült természetes krémek",
    name: "Bőrápoló",
    slug: "borapolo",
    sortOrder: 2,
  },
  {
    description: "Izomfeszültség és görcsök oldására készült balzsamok",
    name: "Izomfeszültség",
    slug: "izomfeszultseg",
    sortOrder: 3,
  },
];

const seed = async () => {
  console.log("Seeding database...");

  const insertedCategories = await db
    .insert(categories)
    .values(seedCategories)
    .returning();

  const categoryMap = new Map(insertedCategories.map((cat) => [cat.slug, cat.id]));

  const seedProducts = [
    {
      categoryId: categoryMap.get("fajdalomcsillapito")!,
      description: "Nyugtató hatású levendulás kenőcs, amely segít az esti ellazulásban és a feszültség oldásában. Természetes levendulaolajjal készült, gyengéd illattal.",
      images: [],
      ingredients: "Levendulaolaj, méhviasz, sheavaj, kókuszolaj, E-vitamin",
      isActive: true,
      name: "Levendulás nyugtató kenőcs",
      priceHuf: 3490,
      slug: "levendulas-nyugtato-kenocs",
      stock: 50,
      weight: 50,
    },
    {
      categoryId: categoryMap.get("fajdalomcsillapito")!,
      description: "Frissítő mentás balzsam, amely kellemes hűsítő érzést nyújt. Ideális fejfájás és migrén esetén a halántékra és a tarkóra alkalmazva.",
      images: [],
      ingredients: "Borsmenta olaj, eukaliptusz olaj, méhviasz, mandulaolaj, mentol kristály",
      isActive: true,
      name: "Mentás hűsítő balzsam",
      priceHuf: 2990,
      slug: "mentas-husito-balzsam",
      stock: 50,
      weight: 30,
    },
    {
      categoryId: categoryMap.get("borapolo")!,
      description: "Gazdag körömvirág krém, amely mélyen hidratálja és regenerálja a száraz, irritált bőrt. Mindennapi bőrápolásra is kiválóan alkalmas.",
      images: [],
      ingredients: "Körömvirág kivonat, sheavaj, kakaóvaj, jojobaolaj, méhviasz, D-pantenol",
      isActive: true,
      name: "Körömvirág bőrápoló krém",
      priceHuf: 4290,
      slug: "koromvirag-borapolo-krem",
      stock: 50,
      weight: 50,
    },
    {
      categoryId: categoryMap.get("borapolo")!,
      description: "Antibakteriális teafaolaj kenőcs problémás bőrre. Segít a bőr tisztulásában és a pattanások kezelésében természetes módon.",
      images: [],
      ingredients: "Teafaolaj, aloe vera, cinkoxid, méhviasz, kendermagolaj",
      isActive: true,
      name: "Teafa tisztító kenőcs",
      priceHuf: 3690,
      slug: "teafa-tisztito-kenocs",
      stock: 50,
      weight: 30,
    },
    {
      categoryId: categoryMap.get("izomfeszultseg")!,
      description: "Élénkítő rozmaringos kenőcs, amely segít az izomfáradtság és a sportolás utáni regeneráció felgyorsításában. Masszázshoz is kiválóan alkalmas.",
      images: [],
      ingredients: "Rozmaringolaj, eukaliptusz olaj, kámfor, méhviasz, szezámolaj",
      isActive: true,
      name: "Rozmaring izomfrissítő",
      priceHuf: 4490,
      slug: "rozmaring-izomfrissito",
      stock: 50,
      weight: 75,
    },
    {
      categoryId: categoryMap.get("izomfeszultseg")!,
      description: "Hatékony ördögcsáklya balzsam ízületi problémákra. Hagyományos gyógynövényes összetétel, amely segít az ízületi merevség és fájdalom enyhítésében.",
      images: [],
      ingredients: "Ördögcsáklya kivonat, arnikafű, borsmenta olaj, méhviasz, olívaolaj, gyömbér kivonat",
      isActive: true,
      name: "Ördögcsáklya ízületi balzsam",
      priceHuf: 5290,
      slug: "ordogcsaklya-izuleti-balzsam",
      stock: 50,
      weight: 50,
    },
  ];

  await db.insert(products).values(seedProducts);

  console.log(`Seeded ${insertedCategories.length} categories and ${seedProducts.length} products.`);
  process.exit(0);
};

seed().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
