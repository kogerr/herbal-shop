export type Category = {
  description?: string;
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export type Product = {
  categoryId: string;
  createdAt: string;
  description: string;
  id: string;
  images: string[];
  ingredients: string;
  isActive: boolean;
  name: string;
  priceHuf: number;
  slug: string;
  stock: number;
  updatedAt: string;
  weight: number;
};

export type ProductWithCategory = Product & {
  category: Category;
};
