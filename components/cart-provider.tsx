"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  modelName: string | null;
  customization: string | null;
  price: number | null;
  status: "in_stock" | "preorder";
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "fwk-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as CartItem[];
          setItems(parsed.map((item) => ({ ...item, quantity: item.quantity ?? 1 })));
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
      setReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, ready]);

  const value: CartContextValue = {
    items,
    ready,
    addItem: (item) =>
      setItems((current) => {
        const existingIndex = current.findIndex(
          (entry) =>
            entry.productId === item.productId &&
            entry.modelName === item.modelName &&
            entry.customization === item.customization
        );
        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + 1,
          };
          return next;
        }
        return [...current, { ...item, id: crypto.randomUUID(), quantity: 1 }];
      }),
    removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
    updateQuantity: (id, quantity) =>
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
      ),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}