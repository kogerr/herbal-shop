import type { CartItem, Product } from "@webshop/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartState = {
  items: CartItem[];
};

type CartActions = {
  addItem: (product: Product, quantity: number) => void;
  clearCart: () => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
};

type CartStore = CartState & CartActions & {
  subtotal: number;
  totalItems: number;
};

const computeDerived = (items: CartItem[]) => ({
  subtotal: items.reduce((sum, item) => sum + item.product.priceHuf * item.quantity, 0),
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
});

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      ...computeDerived([]),
      addItem: (product, quantity) => {
        const items = get().items;
        const existing = items.find((item) => item.product.id === product.id);
        const newItems = existing
          ? items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          : [...items, { product, quantity }];
        set({ items: newItems, ...computeDerived(newItems) });
      },
      clearCart: () => set({ items: [], ...computeDerived([]) }),
      removeItem: (productId) => {
        const newItems = get().items.filter((item) => item.product.id !== productId);
        set({ items: newItems, ...computeDerived(newItems) });
      },
      updateQuantity: (productId, quantity) => {
        const newItems = get().items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        set({ items: newItems, ...computeDerived(newItems) });
      },
    }),
    { name: "cart-storage" },
  ),
);
