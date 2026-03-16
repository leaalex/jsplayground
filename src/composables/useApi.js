import { useAuth } from './useAuth'

const API_BASE = '/api'

export async function api(path, options = {}) {
  const { token } = useAuth()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`
  }
  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
  })
  if (res.status === 401) {
    useAuth().logout()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  if (res.status === 204) {
    return null
  }
  return res.json()
}
