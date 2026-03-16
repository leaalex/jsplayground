<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'run'])

const editorRef = ref(null)
let editor = null

onMounted(async () => {
  const monaco = await import('monaco-editor')
  editor = monaco.editor.create(editorRef.value, {
    value: props.modelValue,
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    fontSize: 14,
  })

  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor.getValue())
  })

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    emit('run')
  })
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (editor && editor.getValue() !== newVal) {
      editor.setValue(newVal)
    }
  }
)
</script>

<template>
  <div ref="editorRef" class="code-editor"></div>
</template>

<style scoped>
.code-editor {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
