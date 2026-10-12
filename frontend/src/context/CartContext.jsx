import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

import { FALLBACK_PRODUCTS } from '../api/fallbackData';

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('veyro_cart');
    return saved ? JSON.parse(saved) : { items: [], totalItems: 0, subtotal: 0, estimatedShipping: 0, total: 0 };
  });
  const [loading, setLoading] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('veyro_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data && Array.isArray(res.data.items)) {
        setCart(res.data);
      }
    } catch (err) {
      // Keep local cart state intact
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
      if (res.data && Array.isArray(res.data.items)) {
        setCart(res.data);
      }
      showSuccess('Item added to cart!');
      return true;
    } catch (err) {
      // Local fallback for offline/preview mode
      const prod = FALLBACK_PRODUCTS.find((p) => p.id === productId) || {
        id: productId,
        name: 'Curated Item #' + productId,
        price: 2999,
        salePrice: 2499,
        primaryImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      };
      setCart((prev) => {
        const items = [...(prev.items || [])];
        const existingIdx = items.findIndex((i) => i.productId === productId);
        const unitPrice = prod.salePrice || prod.price;
        if (existingIdx > -1) {
          items[existingIdx] = {
            ...items[existingIdx],
            quantity: items[existingIdx].quantity + quantity,
            subtotal: (items[existingIdx].quantity + quantity) * unitPrice,
          };
        } else {
          items.push({
            id: Date.now(),
            productId: prod.id,
            productName: prod.name,
            productSlug: prod.slug,
            unitPrice,
            quantity,
            subtotal: unitPrice * quantity,
            imageUrl: prod.primaryImageUrl,
          });
        }
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
        const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
        const total = subtotal > 500 ? subtotal : subtotal + 50;
        return { items, totalItems, subtotal, estimatedShipping: subtotal > 500 ? 0 : 50, total };
      });
      showSuccess('Item added to cart!');
      return true;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.patch(`/cart/items/${itemId}`, { quantity });
      if (res.data && Array.isArray(res.data.items)) {
        setCart(res.data);
      }
    } catch (err) {
      setCart((prev) => {
        const items = (prev.items || [])
          .map((i) => (i.id === itemId ? { ...i, quantity, subtotal: i.unitPrice * quantity } : i))
          .filter((i) => i.quantity > 0);
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
        const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
        return { ...prev, items, totalItems, subtotal, total: subtotal > 500 ? subtotal : subtotal + 50 };
      });
    }
  };

  const removeItem = async (itemId) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      if (res.data && Array.isArray(res.data.items)) {
        setCart(res.data);
      }
      showSuccess('Item removed from cart.');
    } catch (err) {
      setCart((prev) => {
        const items = (prev.items || []).filter((i) => i.id !== itemId);
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
        const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
        return { ...prev, items, totalItems, subtotal, total: subtotal > 500 ? subtotal : subtotal + 50 };
      });
      showSuccess('Item removed from cart.');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      await api.delete('/cart');
    } catch (err) {
      // Local clear
    }
    setCart({ items: [], totalItems: 0, subtotal: 0, estimatedShipping: 0, total: 0 });
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
