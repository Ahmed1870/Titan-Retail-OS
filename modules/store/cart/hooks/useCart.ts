"use client";
'use client';
import { useState, useEffect } from 'react';

// تعريف واجهة المنتج داخل السلة
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export function useCart(tenantId: string) {
  // العزل الديناميكي: كل متجر له مفتاح تخزين مختلف
  const CART_KEY = `titan_cart_${tenantId}`;
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) setItems(JSON.parse(saved));
    setIsLoaded(true);
  }, [CART_KEY]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded, CART_KEY]);

  const addToCart = (product: CartItem) => {
    setItems(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(current => current.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setItems(current => 
      current.map(item => item.id === productId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return { items, addToCart, removeFromCart, updateQuantity, clearCart, total, isLoaded };
}
