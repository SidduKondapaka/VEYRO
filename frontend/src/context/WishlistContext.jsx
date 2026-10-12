import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const { refreshCart } = useCart();
  const [wishlist, setWishlist] = useState({ items: [], totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist({ items: [], totalItems: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      setWishlist(res.data);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    return wishlist.items.some((item) => item.productId === productId);
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      showError('Please sign in to save items to your wishlist.');
      return false;
    }

    if (isInWishlist(productId)) {
      try {
        const res = await api.delete(`/wishlist/items/${productId}`);
        if (res.data && Array.isArray(res.data.items)) {
          setWishlist(res.data);
        }
      } catch {
        setWishlist((prev) => {
          const items = (prev.items || []).filter((i) => i.productId !== productId);
          return { items, totalItems: items.length };
        });
      }
      showSuccess('Item removed from wishlist.');
      return false;
    } else {
      try {
        const res = await api.post(`/wishlist/items/${productId}`);
        if (res.data && Array.isArray(res.data.items)) {
          setWishlist(res.data);
        }
      } catch {
        setWishlist((prev) => {
          const items = [...(prev.items || []), { productId, id: Date.now() }];
          return { items, totalItems: items.length };
        });
      }
      showSuccess('Item added to your wishlist!');
      return true;
    }
  };

  const moveToCart = async (productId) => {
    if (!isAuthenticated) return;
    try {
      await api.post(`/wishlist/items/${productId}/move-to-cart`);
      await fetchWishlist();
      await refreshCart();
      showSuccess('Moved item to your cart!');
    } catch (err) {
      showError('Failed to move item to cart.');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        moveToCart,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
