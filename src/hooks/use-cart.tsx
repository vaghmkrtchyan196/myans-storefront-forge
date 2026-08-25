import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { FREE_SHIPPING_THRESHOLD_AMD, SHIPPING_AMD, type CartLine } from "@/lib/types";

const STORAGE_KEY = "myans_cart_v1";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  addLine: (line: CartLine) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  removeLine: (productId: string, size: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable (private mode) — cart stays in memory */
    }
  }, [lines, hydrated]);

  const addLine = useCallback((line: CartLine) => {
    setLines((prev) => {
      const index = prev.findIndex(
        (item) => item.productId === line.productId && item.size === line.size,
      );
      if (index === -1) return [...prev, line];
      const next = prev.slice();
      next[index] = { ...next[index], quantity: next[index].quantity + line.quantity };
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, size: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((item) => !(item.productId === productId && item.size === size))
        : prev.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity: Math.min(quantity, 99) }
              : item,
          ),
    );
  }, []);

  const removeLine = useCallback((productId: string, size: string) => {
    setLines((prev) => prev.filter((item) => !(item.productId === productId && item.size === size)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, line) => sum + line.price_amd * line.quantity, 0);
    const shipping =
      subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD_AMD ? 0 : SHIPPING_AMD;
    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      addLine,
      setQuantity,
      removeLine,
      clear,
    };
  }, [lines, addLine, setQuantity, removeLine, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
