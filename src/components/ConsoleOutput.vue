<script setup>
defineProps({
  logs: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="flex-1 overflow-y-auto p-2 font-mono text-sm leading-tight">
    <div
      v-for="(log, i) in logs"
      :key="i"
      class="break-all leading-tight"
      :class="{
        'text-slate-800': log.type === 'log',
        'text-red-600': log.type === 'error',
        'text-amber-600': log.type === 'warn',
      }"
    >
      {{ log.args }}
    </div>
    <div v-if="logs.length === 0" class="italic text-slate-400">
      Output will appear here after you run your code.
    </div>
  </div>
</template>
