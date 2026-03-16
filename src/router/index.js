import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import LoginView from '../views/LoginView.vue'
import PlaygroundView from '../views/PlaygroundView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/', name: 'playground', component: PlaygroundView },
  ],
})

router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuth()
  if (!to.meta.public && !isAuthenticated.value) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated.value) {
    next({ name: 'playground' })
  } else {
    next()
  }
})

export default router
