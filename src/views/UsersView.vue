<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PencilSquareIcon } from '@heroicons/vue/24/outline'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import { useAuth } from '../composables/useAuth'
import { api } from '../composables/useApi'

const router = useRouter()
const { isAdmin } = useAuth()

const users = ref([])
const loading = ref(false)
const editingUserId = ref(null)
const editFullname = ref('')
const editEmail = ref('')
const editRole = ref('student')

watch(isAdmin, (v) => {
  if (!v && router.currentRoute.value.name === 'users') {
    router.push('/files')
  }
}, { immediate: true })

async function load() {
  if (!isAdmin.value) return
  loading.value = true
  try {
    users.value = await api('/users')
  } catch (e) {
    if (e.message?.includes('admin') || e.message?.includes('403')) {
      router.push('/files')
    } else {
      alert(e.message)
    }
  } finally {
    loading.value = false
  }
}

function startEdit(u) {
  editingUserId.value = u.id
  editFullname.value = u.fullname || ''
  editEmail.value = u.email || ''
  editRole.value = u.role || 'student'
}

function cancelEdit() {
  editingUserId.value = null
}

async function saveEdit() {
  const id = editingUserId.value
  if (!id) return
  try {
    const updated = await api(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        fullname: editFullname.value.trim(),
        email: editEmail.value.trim(),
        role: editRole.value,
      }),
    })
    const u = users.value.find((x) => x.id === id)
    if (u) {
      u.fullname = updated.fullname
      u.email = updated.email
      u.role = updated.role
    }
  } catch (e) {
    alert(e.message)
  }
  cancelEdit()
}

onMounted(() => {
  if (isAdmin.value) load()
  else router.push('/files')
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50">
    <AppHeader>
      <router-link
        to="/files"
        class="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Files
      </router-link>
    </AppHeader>

    <main class="flex-1 px-2 py-4">
      <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 px-4 py-2">
          <h2 class="text-sm font-medium text-slate-800">Users</h2>
        </div>

        <div v-if="loading" class="px-4 py-8 text-center text-sm text-slate-500">
          Loading...
        </div>

        <template v-else>
          <table class="w-full table-fixed">
            <colgroup>
              <col style="width: 28%" />
              <col style="width: 28%" />
              <col style="width: 14%" />
              <col style="width: 18%" />
              <col style="width: auto" />
            </colgroup>
            <thead>
              <tr class="border-b border-slate-200 text-left text-xs text-slate-500">
                <th class="px-4 py-2 font-medium">Email</th>
                <th class="px-4 py-2 font-medium">Full name</th>
                <th class="px-4 py-2 font-medium">Role</th>
                <th class="px-4 py-2 font-medium">Created</th>
                <th class="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="u in users"
                :key="u.id"
                class="border-b border-slate-100 hover:bg-slate-50"
              >
                <td class="px-4 py-2">
                  <template v-if="editingUserId === u.id">
                    <input
                      v-model="editEmail"
                      type="email"
                      class="w-full rounded border border-slate-300 px-1.5 py-0.5 text-xs"
                      placeholder="Email"
                    />
                  </template>
                  <span v-else class="truncate text-xs text-slate-800">{{ u.email }}</span>
                </td>
                <td class="px-4 py-2">
                  <template v-if="editingUserId === u.id">
                    <input
                      v-model="editFullname"
                      type="text"
                      class="w-full rounded border border-slate-300 px-1.5 py-0.5 text-xs"
                      placeholder="Full name"
                    />
                  </template>
                  <span v-else class="truncate text-xs text-slate-800">{{ u.fullname || '-' }}</span>
                </td>
                <td class="px-4 py-2">
                  <template v-if="editingUserId === u.id">
                    <select
                      v-model="editRole"
                      class="rounded border border-slate-300 px-1.5 py-0.5 text-xs"
                    >
                      <option value="student">student</option>
                      <option value="admin">admin</option>
                    </select>
                  </template>
                  <span v-else class="text-xs text-slate-600">{{ u.role }}</span>
                </td>
                <td class="truncate px-4 py-2 text-xs text-slate-500">{{ u.created_at || '-' }}</td>
                <td class="px-4 py-2">
                  <template v-if="editingUserId === u.id">
                    <button
                      type="button"
                      class="rounded px-1.5 py-0.5 text-xs text-blue-600 hover:bg-blue-50"
                      @click="saveEdit"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      class="ml-1 rounded px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
                      @click="cancelEdit"
                    >
                      Cancel
                    </button>
                  </template>
                  <button
                    v-else
                    type="button"
                    class="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="Edit"
                    @click="startEdit(u)"
                  >
                    <PencilSquareIcon class="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="users.length === 0 && !loading" class="px-4 py-8 text-center text-sm text-slate-500">
            No users.
          </div>
        </template>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
