<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { api } from '../composables/useApi'

const router = useRouter()
const { setToken } = useAuth()

const mode = ref('login')
const fullname = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    const path = mode.value === 'login' ? '/auth/login' : '/auth/register'
    const body = mode.value === 'login'
      ? { email: email.value, password: password.value }
      : { fullname: fullname.value, email: email.value, password: password.value }
    const data = await api(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    setToken(data.accessToken)
    router.push('/')
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="login">
    <div class="login-card">
      <h1>JS Playground</h1>
      <p class="subtitle">Sign in to save your files</p>

      <form @submit.prevent="submit" class="form">
        <input
          v-if="mode === 'register'"
          v-model="fullname"
          type="text"
          placeholder="Full name"
          required
          class="input"
        />
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
          class="input"
        />
        <input
          v-model="password"
          type="password"
          :placeholder="mode === 'register' ? 'Password (min 6)' : 'Password'"
          required
          :minlength="mode === 'register' ? 6 : undefined"
          class="input"
        />
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn">
          {{ mode === 'login' ? 'Log in' : 'Register' }}
        </button>
      </form>

      <button type="button" class="switch" @click="mode = mode === 'login' ? 'register' : 'login'">
        {{ mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Log in' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  background: #1e293b;
  border-radius: 0.5rem;
  border: 1px solid #334155;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input {
  padding: 0.75rem 1rem;
  border: 1px solid #334155;
  border-radius: 0.375rem;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 1rem;
}

.input::placeholder {
  color: #64748b;
}

.error {
  color: #f87171;
  font-size: 0.875rem;
}

.btn {
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}

.btn:hover {
  background: #2563eb;
}

.switch {
  margin-top: 1rem;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
}

.switch:hover {
  color: #e2e8f0;
}
</style>
