<script setup>
import { ref, watch } from 'vue'
import CodeEditor from '../components/CodeEditor.vue'
import ConsoleOutput from '../components/ConsoleOutput.vue'
import FileList from '../components/FileList.vue'
import { useAuth } from '../composables/useAuth'
import { api } from '../composables/useApi'

const { logout } = useAuth()
const selectedFileId = ref(null)
const selectedFile = ref(null)
const code = ref(`// Welcome to JS Playground!
// Write JavaScript and click Run to see the output.

console.log('Hello, world!')
console.log(2 + 2)
`)
const logs = ref([])
const saving = ref(false)

async function runCode(source) {
  try {
    const res = await api('/run', {
      method: 'POST',
      body: JSON.stringify({ code: source }),
    })
    if (res.error) {
      logs.value = [{ type: 'error', args: res.error }]
    } else {
      const lines = (res.output || '').split('\n').filter(Boolean)
      logs.value = lines.map((line) => ({ type: 'log', args: line }))
    }
  } catch (e) {
    logs.value = [{ type: 'error', args: e.message }]
  }
}

function handleRun() {
  runCode(code.value)
}

function onSelectFile(file) {
  selectedFile.value = file
  if (file) {
    code.value = file.content || ''
  }
}

async function save() {
  if (!selectedFileId.value) return
  saving.value = true
  try {
    await api(`/files/${selectedFileId.value}`, {
      method: 'PUT',
      body: JSON.stringify({ content: code.value }),
    })
  } catch (e) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}

watch(
  () => selectedFile.value,
  (f) => {
    if (f) code.value = f.content || ''
  },
  { immediate: true }
)
</script>

<template>
  <div class="playground">
    <header class="header">
      <h1 class="title">JS Playground</h1>
      <div class="header-actions">
        <button
          v-if="selectedFileId"
          class="btn"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
        <button class="run-btn" @click="handleRun">Run (Ctrl+Enter)</button>
        <button class="btn btn-outline" @click="logout">Logout</button>
      </div>
    </header>

    <div class="main">
      <FileList v-model="selectedFileId" @select="onSelectFile" />

    <div class="panels">
      <section class="editor-panel">
        <CodeEditor v-model="code" @run="handleRun" />
      </section>

      <section class="console-panel">
        <h2 class="panel-title">Console</h2>
        <ConsoleOutput :logs="logs" />
      </section>
    </div>
    </div>
  </div>
</template>

<style scoped>
.playground {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.run-btn {
  padding: 0.5rem 1.25rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.run-btn:hover {
  background: #2563eb;
}

.btn {
  padding: 0.5rem 1rem;
  background: #334155;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  border: 1px solid #334155;
}

.main {
  flex: 1;
  display: flex;
  min-height: 0;
}

.panels {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.editor-panel {
  flex: 1;
  min-height: 200px;
}

.console-panel {
  border-top: 1px solid #334155;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  max-height: 40vh;
}

.panel-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #334155;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
