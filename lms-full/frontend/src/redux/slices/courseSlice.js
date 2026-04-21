// courseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { courseAPI, categoryAPI } from '../../utils/api';

export const fetchCourses = createAsyncThunk('courses/fetch', async (params, { rejectWithValue }) => {
  try { const { data } = await courseAPI.getAll(params); return data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const fetchCategories = createAsyncThunk('courses/fetchCats', async (_, { rejectWithValue }) => {
  try { const { data } = await categoryAPI.getAll(); return data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: { list: [], categories: [], current: null, total: 0, pages: 1, loading: false, error: null, filters: { search: '', category: '', level: '', sort: 'newest' } },
  reducers: {
    setFilters: (s, { payload }) => { s.filters = { ...s.filters, ...payload }; },
    setCurrent: (s, { payload }) => { s.current = payload; },
  },
  extraReducers: b => {
    b.addCase(fetchCourses.pending,    s => { s.loading = true; })
     .addCase(fetchCourses.fulfilled,  (s, { payload }) => { s.loading = false; s.list = payload.courses; s.total = payload.total; s.pages = payload.pages; })
     .addCase(fetchCourses.rejected,   (s, { payload }) => { s.loading = false; s.error = payload; })
     .addCase(fetchCategories.fulfilled, (s, { payload }) => { s.categories = payload; });
  },
});

export const { setFilters, setCurrent } = courseSlice.actions;
export default courseSlice.reducer;
