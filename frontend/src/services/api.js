import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
  timeout: 5000,
})

export const loginRequest = async (payload) => {
  const { data } = await api.post('/login', payload)
  return data
}

export const registerRequest = async (payload) => {
  const { data } = await api.post('/register', payload)
  return data
}

export const logoutRequest = async () => {
  const { data } = await api.post('/logout')
  return data
}

export const getSystemHealth = async () => {
  const { data } = await api.get('/health')
  return data
}

export default api
