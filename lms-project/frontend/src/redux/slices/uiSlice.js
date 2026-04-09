import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mobileMenuOpen: false,
    searchOpen: false,
    cartOpen: false,
    notificationsOpen: false,
    profileMenuOpen: false,
  },
  reducers: {
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    toggleNotifications: (state) => { state.notificationsOpen = !state.notificationsOpen; },
    toggleProfileMenu: (state) => { state.profileMenuOpen = !state.profileMenuOpen; },
    closeAll: (state) => {
      state.mobileMenuOpen = false;
      state.searchOpen = false;
      state.cartOpen = false;
      state.notificationsOpen = false;
      state.profileMenuOpen = false;
    },
  },
});

export const {
  toggleMobileMenu, toggleSearch, toggleCart,
  toggleNotifications, toggleProfileMenu, closeAll,
} = uiSlice.actions;
export default uiSlice.reducer;
