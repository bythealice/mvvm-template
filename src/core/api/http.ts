import axios from 'axios'

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: injeta Bearer token
http.interceptors.request.use((config) => {
  // Exemplo: lê token do Zustand ou cookie
  // const token = useAuthStore.getState().token
  // if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: trata erros globais
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // redireciona para login se necessário
    }
    return Promise.reject(error)
  }
)
