import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { App, Category } from '../types';

interface AppState {
  apps: App[];
  featuredApps: App[];
  categories: Category[];
  selectedApp: App | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category?: string;
    search?: string;
    sortBy?: string;
  };
}

const initialState: AppState = {
  apps: [],
  featuredApps: [],
  categories: [],
  selectedApp: null,
  isLoading: false,
  error: null,
  filters: {},
};

const appSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setApps: (state, action: PayloadAction<App[]>) => {
      state.apps = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setFeaturedApps: (state, action: PayloadAction<App[]>) => {
      state.featuredApps = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setSelectedApp: (state, action: PayloadAction<App | null>) => {
      state.selectedApp = action.payload;
    },
    addApp: (state, action: PayloadAction<App>) => {
      state.apps.unshift(action.payload);
    },
    updateApp: (state, action: PayloadAction<App>) => {
      const index = state.apps.findIndex((app) => app._id === action.payload._id);
      if (index !== -1) {
        state.apps[index] = action.payload;
      }
    },
    removeApp: (state, action: PayloadAction<string>) => {
      state.apps = state.apps.filter((app) => app._id !== action.payload);
    },
    setFilters: (state, action: PayloadAction<AppState['filters']>) => {
      state.filters = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setApps,
  setFeaturedApps,
  setCategories,
  setSelectedApp,
  addApp,
  updateApp,
  removeApp,
  setFilters,
} = appSlice.actions;

export default appSlice.reducer;
