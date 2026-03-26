'use client'
import { create } from 'zustand'

interface CartItem { id: string; name: string; price: number; quantity: number }
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: number;
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  total: 0,
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.id === item.id)
    const newItems = existing 
      ? state.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...state.items, item]
    return { items: newItems, total: newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0) }
  }),
  removeItem: (id) => set((state) => {
    const newItems = state.items.filter(i => i.id !== id)
    return { items: newItems, total: newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0) }
  }),
  clear: () => set({ items: [], total: 0 })
}))
