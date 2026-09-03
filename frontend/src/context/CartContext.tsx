'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Order } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  orders: Order[];
  placeOrder: (customer: { name: string; email: string; phone: string; address?: string }) => Order;
  getOrderById: (orderId: string) => Order | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('ignou_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem('ignou_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (_e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ignou_cart', JSON.stringify(cart));
    } catch (_e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('ignou_orders', JSON.stringify(orders));
    } catch (_e) {}
  }, [orders]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((i) => i.id === newItem.id);
      const qty = newItem.quantity || 1;
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [...prevCart, { ...newItem, quantity: qty }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = (customer: { name: string; email: string; phone: string; address?: string }) => {
    const newOrder: Order = {
      orderId: `IGH-${Math.floor(100000 + Math.random() * 900000)}`,
      studentName: customer.name,
      studentEmail: customer.email,
      studentPhone: customer.phone,
      address: customer.address,
      items: [...cart],
      totalAmount: totalPrice,
      status: 'Order Placed',
      createdAt: new Date().toISOString()
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const getOrderById = (orderId: string) => {
    const cleanId = orderId.trim().toUpperCase();
    return orders.find((o) => o.orderId.toUpperCase() === cleanId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        orders,
        placeOrder,
        getOrderById
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
