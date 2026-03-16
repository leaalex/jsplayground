<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PencilSquareIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useAuth } from '../composables/useAuth'
import { api } from '../composables/useApi'

const router = useRouter()
const { isAdmin, logout } = useAuth()

const files = ref([])
const loading = ref(false)
const importInputRef = ref(null)
const editingFileId = ref(null)
const editingName = ref('')

const groupedFiles = computed(() => {
  if (!isAdmin.value) {
    return [{ user: null, files: files.value }]
  }
  const byUser = new Map()
  for (const f of files.value) {
    const key = f.user ? `${f.user.email}` : 'unknown'
    if (!byUser.has(key)) {
      byUser.set(key, {
        user: f.user || { fullname: 'Unknown', email: 'unknown' },
        files: [],
      })
    }
    byUser.get(key).files.push(f)
  }
  return Array.from(byUser.values())
})

async function load() {
  loading.value = true
  try {
    files.value = await api('/files')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString()
}

function exportFile(file) {
  const blob = new Blob([file.content || ''], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name || 'file.js'
  a.click()
  URL.revokeObjectURL(url)
}

async function deleteFile(file, e) {
  e?.preventDefault()
  if (!confirm('Delete this file?')) return
  try {
    await api(`/files/${file.id}`, { method: 'DELETE' })
    files.value = files.value.filter((f) => f.id !== file.id)
  } catch (e) {
    alert(e.message)
  }
}

function openFile(file) {
  router.push({ name: 'playground', params: { id: file.id } })
}

async function toggleVerified(file) {
  if (!isAdmin.value) return
  try {
    const updated = await api(`/files/${file.id}`, {
      method: 'PUT',
      body: JSON.stringify({ verified: !file.verified }),
    })
    file.verified = updated.verified
  } catch (e) {
    alert(e.message)
  }
}

function startRename(file) {
  editingFileId.value = file.id
  editingName.value = file.name || ''
}

function cancelRename() {
  editingFileId.value = null
  editingName.value = ''
}

async function saveRename() {
  const id = editingFileId.value
  if (!id) return
  const name = editingName.value.trim() || 'untitled.js'
  try {
    const updated = await api(`/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: name.endsWith('.js') ? name : name + '.js' }),
    })
    const f = files.value.find((x) => x.id === id)
    if (f) f.name = updated.name
  } catch (e) {
    alert(e.message)
  }
  cancelRename()
}

function triggerImport() {
  importInputRef.value?.click()
}

async function onImport(e) {
  const input = e.target
  const file = input.files?.[0]
  if (!file) return
  input.value = ''
  try {
    const content = await file.text()
    const name = file.name || 'untitled.js'
    const created = await api('/files', {
      method: 'POST',
      body: JSON.stringify({
        name,
        path: '',
        content: content || '// Imported file\n',
      }),
    })
    files.value = [created, ...files.value]
    router.push({ name: 'playground', params: { id: created.id } })
  } catch (err) {
    alert(err.message)
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
      <div class="mx-auto flex max-w-6xl items-center justify-between">
        <h1 class="text-base font-semibold text-slate-800">JS Playground</h1>
        <div class="flex items-center gap-2">
          <router-link
            to="/files/new"
            class="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            New file
          </router-link>
          <button
            type="button"
            class="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            @click="triggerImport"
          >
            Import
          </button>
          <input
            ref="importInputRef"
            type="file"
            accept=".js,.ts,.mjs"
            class="hidden"
            @change="onImport"
          />
          <button
            type="button"
            class="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-4">
      <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 px-4 py-2">
          <h2 class="text-sm font-medium text-slate-800">Your files</h2>
        </div>

        <div v-if="loading" class="px-4 py-8 text-center text-sm text-slate-500">
          Loading...
        </div>

        <template v-else>
          <template v-for="group in groupedFiles" :key="group.user?.email ?? 'mine'">
            <div v-if="isAdmin && group.user" class="border-b border-slate-100 bg-slate-50 px-4 py-1">
              <span class="text-xs font-medium text-slate-600">
                {{ group.user.fullname || group.user.email }} ({{ group.user.email }})
              </span>
            </div>
            <table class="w-full table-fixed">
              <colgroup>
                <col style="width: 32%" />
                <col style="width: 36px" />
                <col style="width: 26%" />
                <col style="width: 18%" />
                <col style="width: auto" />
              </colgroup>
              <thead>
                <tr class="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th class="px-4 py-2 font-medium">Name</th>
                  <th class="px-1 py-2 text-center font-medium">✓</th>
                  <th class="px-4 py-2 font-medium">Path</th>
                  <th class="px-4 py-2 font-medium">Updated</th>
                  <th class="px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="file in group.files"
                  :key="file.id"
                  class="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td class="px-4 py-2">
                    <div class="flex min-w-0 items-center gap-1">
                      <template v-if="editingFileId === file.id">
                        <input
                          v-model="editingName"
                          type="text"
                          class="min-w-0 flex-1 rounded border border-slate-300 px-1.5 py-0.5 text-xs"
                          @keydown.enter="saveRename"
                          @keydown.esc="cancelRename"
                          @blur="saveRename"
                        />
                      </template>
                      <template v-else>
                        <button
                          type="button"
                          class="min-w-0 truncate text-left text-xs font-medium text-blue-600 hover:underline"
                          @click="openFile(file)"
                        >
                          {{ file.name }}
                        </button>
                        <button
                          type="button"
                          class="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="Rename"
                          @click.stop="startRename(file)"
                        >
                          <PencilSquareIcon class="h-3.5 w-3.5" />
                        </button>
                      </template>
                    </div>
                  </td>
                  <td class="px-1 py-2 text-center align-middle">
                    <template v-if="isAdmin">
                      <button
                        type="button"
                        class="inline-flex h-4 w-4 items-center justify-center rounded border transition-colors"
                        :class="file.verified ? 'border-green-500 bg-green-50 text-green-600 hover:bg-green-100' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'"
                        :title="file.verified ? 'Unverify' : 'Verify'"
                        @click="toggleVerified(file)"
                      >
                        <CheckIcon v-if="file.verified" class="h-3 w-3" stroke-width="3" />
                      </button>
                    </template>
                    <CheckIcon v-else-if="file.verified" class="mx-auto h-4 w-4 text-green-600" stroke-width="2.5" />
                  </td>
                  <td class="truncate px-4 py-2 text-xs text-slate-600" :title="file.path || '-'">{{ file.path || '-' }}</td>
                  <td class="truncate px-4 py-2 text-xs text-slate-500">{{ formatDate(file.updated_at) }}</td>
                  <td class="px-4 py-2">
                    <div class="flex flex-wrap gap-1">
                      <button
                        type="button"
                        class="rounded px-1.5 py-0.5 text-xs text-blue-600 hover:bg-blue-50"
                        @click="openFile(file)"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        class="rounded px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
                        @click="exportFile(file)"
                      >
                        Export
                      </button>
                      <button
                        type="button"
                        class="rounded px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-50"
                        @click="deleteFile(file, $event)"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>

          <div v-if="files.length === 0 && !loading" class="px-4 py-8 text-center text-sm text-slate-500">
            No files yet. Create one or import from your computer.
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
