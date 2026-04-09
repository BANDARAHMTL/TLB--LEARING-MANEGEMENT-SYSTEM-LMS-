import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { courseAPI, categoryAPI } from '../../utils/api';

export const fetchCourses = createAsyncThunk('courses/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await courseAPI.getAll(params);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchFeaturedCourses = createAsyncThunk('courses/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await courseAPI.getFeatured();
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchCourseBySlug = createAsyncThunk('courses/fetchBySlug', async (slug, { rejectWithValue }) => {
  try {
    const { data } = await courseAPI.getBySlug(slug);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchCategories = createAsyncThunk('courses/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await categoryAPI.getAll();
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    list: [],
    featured: [],
    current: null,
    categories: [],
    total: 0,
    pages: 1,
    page: 1,
    loading: false,
    error: null,
    filters: { sort: 'default', category: '', level: '', search: '' },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearCurrent: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => { state.loading = true; })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.courses;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.page = action.payload.page;
      })
      .addCase(fetchCourses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeaturedCourses.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchCourseBySlug.pending, (state) => { state.loading = true; state.current = null; })
      .addCase(fetchCourseBySlug.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchCourseBySlug.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload; });
  },
});

export const { setFilters, clearCurrent } = courseSlice.actions;
export default courseSlice.reducer;
