<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuth } from './composables/useAuth'

const { fetchMe } = useAuth()

onMounted(() => {
  fetchMe()
})
</script>

<template>
  <RouterView />
</template>
