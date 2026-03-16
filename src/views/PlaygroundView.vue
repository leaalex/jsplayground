<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import CodeEditor from '../components/CodeEditor.vue'
import ConsoleOutput from '../components/ConsoleOutput.vue'
import { api } from '../composables/useApi'

const route = useRoute()
const router = useRouter()

const fileName = ref('')
const code = ref('// Loading...\n')
const logs = ref([])
const saving = ref(false)
const loading = ref(true)
const horizontal = ref(true)

async function loadFile() {
  const id = route.params.id
  if (!id) {
    router.push('/files')
    return
  }
  loading.value = true
  try {
    const file = await api(`/files/${id}`)
    fileName.value = file.name
    code.value = file.content || '// New file\nconsole.log("Hello!")\n'
  } catch (e) {
    alert(e.message)
    router.push('/files')
  } finally {
    loading.value = false
  }
}

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

async function save() {
  if (!route.params.id) return
  saving.value = true
  try {
    await api(`/files/${route.params.id}`, {
      method: 'PUT',
      body: JSON.stringify({ content: code.value }),
    })
  } catch (e) {
    alert(e.message)
  } finally {
    saving.value = false
  }
}

watch(() => route.params.id, loadFile, { immediate: true })
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 shadow-sm">
      <div class="flex items-center gap-3">
        <router-link to="/files" class="text-sm text-blue-600 hover:underline">← Back</router-link>
        <h1 class="text-sm font-medium text-slate-800">{{ fileName || 'Loading...' }}</h1>
      </div>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
          :title="horizontal ? 'Code left, console right' : 'Code top, console bottom'"
          @click="horizontal = !horizontal"
        >
          {{ horizontal ? '⊟ Vertical' : '⊞ Horizontal' }}
        </button>
        <button
          :disabled="saving"
          class="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          @click="save"
        >
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
        <button
          class="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
          @click="handleRun"
        >
          Run (Ctrl+Enter)
        </button>
      </div>
    </header>

    <div class="flex-1 min-h-0">
      <Splitpanes :horizontal="horizontal" class="h-full">
        <Pane :min-size="35" :size="70">
          <div class="h-full">
            <CodeEditor v-model="code" @run="handleRun" />
          </div>
        </Pane>
        <Pane :min-size="10" :size="30">
          <div class="flex h-full flex-col border-t border-slate-200 bg-white">
            <h2 class="shrink-0 border-b border-slate-200 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Console
            </h2>
            <div class="flex-1 min-h-0 overflow-auto">
              <ConsoleOutput :logs="logs" />
            </div>
          </div>
        </Pane>
      </Splitpanes>
    </div>
  </div>
</template>
