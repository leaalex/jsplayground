import { ref, computed } from 'vue'

const API_BASE = '/api'

const token = ref(localStorage.getItem('accessToken'))
const user = ref(null)

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setToken(newToken, userData = null) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('accessToken', newToken)
      if (userData) {
        user.value = {
          id: userData.id,
          role: userData.role || 'student',
          fullname: userData.fullname || '',
          email: userData.email || '',
        }
      }
    } else {
      localStorage.removeItem('accessToken')
      user.value = null
    }
  }

  function setUser(userData) {
    if (userData) {
      user.value = {
        id: userData.id,
        role: userData.role || 'student',
        fullname: userData.fullname || '',
        email: userData.email || '',
      }
    } else {
      user.value = null
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await fetch(API_BASE + '/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      if (res.status === 401) {
        setToken(null)
        return
      }
      if (!res.ok) throw new Error('Failed to fetch user')
      const data = await res.json()
      setUser(data)
    } catch {
      setToken(null)
    }
  }

  function logout() {
    setToken(null)
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    setToken,
    setUser,
    fetchMe,
    logout,
  }
}
