import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Product, ProductAddon } from '../types/catalog';
import { getCartItemUnitPrice } from '../lib/whatsapp';

const CART_STORAGE_KEY = 'zapcatalogo_cart_v2';

interface CartContextData {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  customizingProduct: Product | null;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
  addCustomizedItem: (
    product: Product,
    quantity: number,
    selectedAddons: ProductAddon[],
    notes: string
  ) => void;
  addItem: (product: Product, notes?: string) => void;
  incrementCartItem: (cartItemId: string) => void;
  decrementCartItem: (cartItemId: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (cartItemIdOrProductId: string) => void;
  updateItemNotes: (cartItemId: string, notes: string) => void;
  getItemQuantity: (productId: string) => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextData | null>(null);

function buildCartItemSignature(
  productId: string,
  addons: ProductAddon[],
  notes: string
): string {
  const addonIds = [...addons]
    .map((a) => a.id)
    .sort()
    .join(',');
  return `${productId}__${addonIds}__${notes.trim().toLowerCase()}`;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved) as CartItem[];
      return parsed.map((item) => ({
        ...item,
        cartItemId: item.cartItemId || `${item.product.id}__default`,
        selectedAddons: Array.isArray(item.selectedAddons) ? item.selectedAddons : [],
        notes: item.notes || '',
      }));
    } catch {
      return [];
    }
  });

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const openProductModal = (product: Product) => {
    setCustomizingProduct(product);
  };

  const closeProductModal = () => {
    setCustomizingProduct(null);
  };

  const addCustomizedItem = (
    product: Product,
    quantity: number,
    selectedAddons: ProductAddon[],
    notes: string
  ) => {
    const sig = buildCartItemSignature(product.id, selectedAddons, notes);
    setItems((prev) => {
      const existing = prev.find((i) => i.cartItemId === sig);
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === sig
            ? {
                ...i,
                product,
                quantity: i.quantity + quantity,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          cartItemId: sig,
          product,
          quantity,
          notes: notes.trim(),
          selectedAddons,
        },
      ];
    });
  };

  const addItem = (product: Product, notes = '') => {
    addCustomizedItem(product, 1, [], notes);
  };

  const incrementCartItem = (cartItemId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const decrementCartItem = (cartItemId: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const decrementItem = (productId: string) => {
    setItems((prev) => {
      const targetIndex = [...prev]
        .reverse()
        .findIndex((i) => i.product.id === productId);
      if (targetIndex === -1) return prev;
      const actualIndex = prev.length - 1 - targetIndex;
      return prev
        .map((item, idx) =>
          idx === actualIndex ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const removeItem = (cartItemIdOrProductId: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          i.cartItemId !== cartItemIdOrProductId &&
          i.product.id !== cartItemIdOrProductId
      )
    );
  };

  const updateItemNotes = (cartItemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.cartItemId === cartItemId || i.product.id === cartItemId
          ? { ...i, notes }
          : i
      )
    );
  };

  const getItemQuantity = (productId: string): number => {
    return items
      .filter((i) => i.product.id === productId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + getCartItemUnitPrice(item) * item.quantity,
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
        customizingProduct,
        openProductModal,
        closeProductModal,
        addCustomizedItem,
        addItem,
        incrementCartItem,
        decrementCartItem,
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
