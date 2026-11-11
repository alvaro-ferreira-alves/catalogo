import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, CartItem, Addon } from '@/types/menu';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, addons?: Addon[], flavor?: string, flavorId?: string) => void;
  removeItem: (productId: string, addonKey?: string, flavor?: string) => void;
  updateQuantity: (productId: string, quantity: number, addonKey?: string, flavor?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/** Returns a stable string key representing a sorted set of addon ids. */
function addonKey(addons?: Addon[]): string {
  if (!addons || addons.length === 0) return '';
  return JSON.stringify([...addons.map((a) => a.id)].sort());
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (product: Product, quantity: number = 1, addons?: Addon[], flavor?: string, flavorId?: string) => {
      setItems((prev) => {
        const key = addonKey(addons);
        const flavorMatch = flavor || '';
        // Match by product id, flavor AND addon set so different variants become separate items
        const existing = prev.find(
          (item) =>
            item.product.id === product.id &&
            (item.flavor || '') === flavorMatch &&
            addonKey(item.addons) === key
        );
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id &&
            (item.flavor || '') === flavorMatch &&
            addonKey(item.addons) === key
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity, addons, flavor, flavorId }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, addonKeyStr?: string, flavor?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (flavor === undefined || (item.flavor || '') === (flavor || '')) &&
            (addonKeyStr === undefined || addonKey(item.addons) === addonKeyStr)
          )
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, addonKeyStr?: string, flavor?: string) => {
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter(
            (item) =>
              !(
                item.product.id === productId &&
                (flavor === undefined || (item.flavor || '') === (flavor || '')) &&
                (addonKeyStr === undefined || addonKey(item.addons) === addonKeyStr)
              )
          )
        );
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId &&
          (flavor === undefined || (item.flavor || '') === (flavor || '')) &&
          (addonKeyStr === undefined || addonKey(item.addons) === addonKeyStr)
            ? { ...item, quantity }
            : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const addonsTotal = (item.addons ?? []).reduce((s, a) => s + a.price, 0);
    return sum + (item.product.price + addonsTotal) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
