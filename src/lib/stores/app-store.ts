import { create } from 'zustand';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
  
  // Loading States
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Error States
  globalError: string | null;
  errorStates: Record<string, string | null>;
  
  // Modal States
  modals: Record<string, boolean>;
  
  // Filters and Search
  searchQuery: string;
  activeFilters: Record<string, unknown>;
}

interface AppActions {
  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Loading Actions
  setGlobalLoading: (loading: boolean) => void;
  setLoading: (key: string, loading: boolean) => void;
  clearLoadingStates: () => void;
  
  // Error Actions
  setGlobalError: (error: string | null) => void;
  setError: (key: string, error: string | null) => void;
  clearErrors: () => void;
  
  // Modal Actions
  openModal: (key: string) => void;
  closeModal: (key: string) => void;
  closeAllModals: () => void;
  
  // Filter Actions
  setSearchQuery: (query: string) => void;
  setFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
  clearFilter: (key: string) => void;
}

type AppStore = AppState & AppActions;

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial State
  sidebarOpen: true,
  theme: 'system',
  notifications: [],
  globalLoading: false,
  loadingStates: {},
  globalError: null,
  errorStates: {},
  modals: {},
  searchQuery: '',
  activeFilters: {},

  // UI Actions
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),

  // Notification Actions
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),

  // Loading Actions
  setGlobalLoading: (globalLoading) => set({ globalLoading }),
  
  setLoading: (key, loading) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: loading,
      },
    }));
  },

  clearLoadingStates: () => set({ loadingStates: {} }),

  // Error Actions
  setGlobalError: (globalError) => set({ globalError }),
  
  setError: (key, error) => {
    set((state) => ({
      errorStates: {
        ...state.errorStates,
        [key]: error,
      },
    }));
  },

  clearErrors: () => set({ globalError: null, errorStates: {} }),

  // Modal Actions
  openModal: (key) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [key]: true,
      },
    }));
  },

  closeModal: (key) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [key]: false,
      },
    }));
  },

  closeAllModals: () => set({ modals: {} }),

  // Filter Actions
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  setFilter: (key, value) => {
    set((state) => ({
      activeFilters: {
        ...state.activeFilters,
        [key]: value,
      },
    }));
  },

  clearFilters: () => set({ activeFilters: {}, searchQuery: '' }),
  
  clearFilter: (key) => {
    set((state) => {
      const newFilters = { ...state.activeFilters };
      delete newFilters[key];
      return { activeFilters: newFilters };
    });
  },
}));

// Selectors for common use cases
export const useSidebar = () => useAppStore((state) => ({
  isOpen: state.sidebarOpen,
  toggle: state.toggleSidebar,
  setOpen: state.setSidebarOpen,
}));

export const useTheme = () => useAppStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme,
}));

export const useNotifications = () => useAppStore((state) => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

export const useLoading = (key?: string) => useAppStore((state) => {
  if (key) {
    return {
      isLoading: state.loadingStates[key] || false,
      setLoading: (loading: boolean) => state.setLoading(key, loading),
    };
  }
  return {
    isLoading: state.globalLoading,
    setLoading: state.setGlobalLoading,
  };
});

export const useError = (key?: string) => useAppStore((state) => {
  if (key) {
    return {
      error: state.errorStates[key],
      setError: (error: string | null) => state.setError(key, error),
    };
  }
  return {
    error: state.globalError,
    setError: state.setGlobalError,
  };
});

export const useModal = (key: string) => useAppStore((state) => ({
  isOpen: state.modals[key] || false,
  open: () => state.openModal(key),
  close: () => state.closeModal(key),
}));

export const useFilters = () => useAppStore((state) => ({
  searchQuery: state.searchQuery,
  activeFilters: state.activeFilters,
  setSearchQuery: state.setSearchQuery,
  setFilter: state.setFilter,
  clearFilters: state.clearFilters,
  clearFilter: state.clearFilter,
}));
