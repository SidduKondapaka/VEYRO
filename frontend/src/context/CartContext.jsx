import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    subtotal: 0,
    estimatedShipping: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Guest cart from localStorage
      const localCart = localStorage.getItem('veyro_guest_cart');
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart);
          setCart(parsed);
        } catch {
          setCart({ items: [], totalItems: 0, subtotal: 0, estimatedShipping: 0, total: 0 });
        }
      }
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showError('Please sign in to add items to your cart.');
      return false;
    }

    try {
      const res = await api.post('/cart/items', { productId, quantity });
      setCart(res.data);
      showSuccess('Item added to cart!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart.';
      showError(msg);
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.patch(`/cart/items/${itemId}`, { quantity });
      setCart(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity.';
      showError(msg);
    }
  };

  const removeItem = async (itemId) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data);
      showSuccess('Item removed from cart.');
    } catch (err) {
      showError('Failed to remove item.');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.delete('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
