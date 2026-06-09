import { create } from 'zustand'

interface AuthState {
  token: string | null
  role: 'manager' | 'viewer' | null
  setToken: (token: string) => void
  setRole: (role: AuthState['role']) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: 'manager', // default para demo
  setToken: (token) => set({ token }),
  setRole: (role) => set({ role }),
  clear: () => set({ token: null, role: null }),
}))
