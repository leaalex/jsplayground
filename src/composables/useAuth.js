import { ref, computed } from 'vue'

const token = ref(localStorage.getItem('accessToken'))

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('accessToken', newToken)
    } else {
      localStorage.removeItem('accessToken')
    }
  }

  function logout() {
    setToken(null)
  }

  return {
    token,
    isAuthenticated,
    setToken,
    logout,
  }
}
