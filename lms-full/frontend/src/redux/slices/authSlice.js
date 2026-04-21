import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../utils/api';

const stored = JSON.parse(localStorage.getItem('lmsUser') || 'null');

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.login(creds);
    localStorage.setItem('lmsUser', JSON.stringify(data.data));
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed'); }
});

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.register(payload);
    localStorage.setItem('lmsUser', JSON.stringify(data.data));
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Registration failed'); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: stored, loading: false, error: null },
  reducers: {
    logout: state => { state.user = null; localStorage.removeItem('lmsUser'); },
    clearError: state => { state.error = null; },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('lmsUser', JSON.stringify(state.user));
    },
  },
  extraReducers: b => {
    b.addCase(loginUser.pending,     s => { s.loading = true; s.error = null; })
     .addCase(loginUser.fulfilled,   (s, a) => { s.loading = false; s.user = a.payload; })
     .addCase(loginUser.rejected,    (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(registerUser.pending,  s => { s.loading = true; s.error = null; })
     .addCase(registerUser.fulfilled,(s, a) => { s.loading = false; s.user = a.payload; })
     .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
