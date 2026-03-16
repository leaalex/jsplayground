<script setup>
defineProps({
  logs: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="console-output">
    <div
      v-for="(log, i) in logs"
      :key="i"
      class="log-entry"
      :class="`log-${log.type}`"
    >
      <span class="log-type">{{ log.type }}:</span>
      <span class="log-content">{{ log.args }}</span>
    </div>
    <div v-if="logs.length === 0" class="log-placeholder">
      Output will appear here after you run your code.
    </div>
  </div>
</template>

<style scoped>
.console-output {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
}

.log-entry {
  padding: 0.25rem 0;
  word-break: break-all;
}

.log-type {
  color: #94a3b8;
  margin-right: 0.5rem;
  font-size: 0.75rem;
}

.log-log .log-content {
  color: #e2e8f0;
}

.log-error .log-content {
  color: #f87171;
}

.log-warn .log-content {
  color: #fbbf24;
}

.log-placeholder {
  color: #64748b;
  font-style: italic;
}
</style>
