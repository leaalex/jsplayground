<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../composables/useApi'

const props = defineProps({
  modelValue: { type: Number, default: null },
})

const emit = defineEmits(['update:modelValue', 'select'])

const files = ref([])
const loading = ref(false)
const newName = ref('')

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

async function createFile() {
  const name = newName.value.trim() || 'untitled.js'
  try {
    const file = await api('/files', {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        path: '',
        content: '// New file\nconsole.log("Hello!")\n',
      }),
    })
    files.value = [file, ...files.value]
    newName.value = ''
    emit('select', file)
    emit('update:modelValue', file.id)
  } catch (e) {
    alert(e.message)
  }
}

async function deleteFile(id, e) {
  e.stopPropagation()
  if (!confirm('Delete this file?')) return
  try {
    await api(`/files/${id}`, { method: 'DELETE' })
    files.value = files.value.filter((f) => f.id !== id)
    if (props.modelValue === id) {
      emit('update:modelValue', null)
      emit('select', null)
    }
  } catch (e) {
    alert(e.message)
  }
}

function selectFile(file) {
  emit('update:modelValue', file.id)
  emit('select', file)
}

onMounted(load)
</script>

<template>
  <div class="file-list">
    <div class="file-list-header">
      <span>Files</span>
    </div>
    <div class="new-file">
      <input
        v-model="newName"
        placeholder="New file..."
        class="input"
        @keydown.enter="createFile"
      />
      <button type="button" class="btn" @click="createFile">+</button>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <ul class="files">
      <li
        v-for="file in files"
        :key="file.id"
        class="file-item"
        :class="{ active: modelValue === file.id }"
        @click="selectFile(file)"
      >
        <span class="file-name">{{ file.name }}</span>
        <button
          type="button"
          class="delete-btn"
          title="Delete"
          @click="deleteFile(file.id, $event)"
        >
          ×
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.file-list {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
}

.file-list-header {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  border-bottom: 1px solid #334155;
}

.new-file {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem;
  border-bottom: 1px solid #334155;
}

.input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #334155;
  border-radius: 0.25rem;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.btn {
  padding: 0.5rem 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
}

.loading {
  padding: 1rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.files {
  list-style: none;
  overflow-y: auto;
  flex: 1;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #1e293b;
}

.file-item:hover {
  background: #1e293b;
}

.file-item.active {
  background: #334155;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
}

.delete-btn {
  opacity: 0.5;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0 0.25rem;
}

.delete-btn:hover {
  opacity: 1;
  color: #f87171;
}
</style>
