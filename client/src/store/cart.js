import { create } from 'zustand'

const API = '/api'

const useCart = create(set => ({
  items: [],
  lastAddedId: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch cart')
      const data = await res.json()
      set({ items: data.cart || [], loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  addToCart: async (product, quantity = 1) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: product._id || product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity
        })
      })
      if (!res.ok) throw new Error('Failed to add to cart')
      const data = await res.json()
      set({ items: data.cart, lastAddedId: product._id || product.id, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  removeFromCart: async id => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: id })
      })
      if (!res.ok) throw new Error('Failed to remove from cart')
      const data = await res.json()
      set({ items: data.cart, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  updateQuantity: async (id, quantity) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/cart/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: id, quantity })
      })
      if (!res.ok) throw new Error('Failed to update cart')
      const data = await res.json()
      set({ items: data.cart, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/cart/clear`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to clear cart')
      set({ items: [], loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  clearLastAdded: () => set({ lastAddedId: null })
}))

export default useCart 