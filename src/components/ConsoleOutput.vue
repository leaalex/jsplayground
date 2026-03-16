<script setup>
defineProps({
  logs: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="flex-1 overflow-y-auto p-2 font-mono text-xs">
    <div
      v-for="(log, i) in logs"
      :key="i"
      class="py-0.5 break-all"
      :class="{
        'text-slate-800': log.type === 'log',
        'text-red-600': log.type === 'error',
        'text-amber-600': log.type === 'warn',
      }"
    >
      <span class="mr-1.5 text-[10px] text-slate-500">{{ log.type }}:</span>
      <span>{{ log.args }}</span>
    </div>
    <div v-if="logs.length === 0" class="italic text-slate-400">
      Output will appear here after you run your code.
    </div>
  </div>
</template>
