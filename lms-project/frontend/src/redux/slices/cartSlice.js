// cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const cartFromStorage = JSON.parse(localStorage.getItem('lmsCart') || '[]');

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: cartFromStorage },
  reducers: {
    addToCart: (state, action) => {
      const exists = state.items.find((i) => i._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
        localStorage.setItem('lmsCart', JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      localStorage.setItem('lmsCart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('lmsCart');
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
