import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Product } from '../types/catalog';
import { getEffectivePrice } from '../lib/whatsapp';

const CART_STORAGE_KEY = 'zapcatalogo_cart_v1';

interface CartContextData {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  addItem: (product: Product, notes?: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  getItemQuantity: (productId: string) => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextData | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const addItem = (product: Product, notes = '') => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? {
                ...i,
                product,
                quantity: i.quantity + 1,
                notes: notes || i.notes,
              }
            : i
        );
      }
      return [...prev, { product, quantity: 1, notes }];
    });
  };

  const decrementItem = (productId: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateItemNotes = (productId: string, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, notes } : i))
    );
  };

  const getItemQuantity = (productId: string): number => {
    return items.find((i) => i.product.id === productId)?.quantity ?? 0;
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + getEffectivePrice(item.product) * item.quantity,
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isCheckoutOpen,
        setIsCheckoutOpen,
        addItem,
        decrementItem,
        removeItem,
        updateItemNotes,
        getItemQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextData {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa estar dentro de CartProvider');
  return ctx;
}
