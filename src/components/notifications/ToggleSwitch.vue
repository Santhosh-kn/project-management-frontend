<template>
  <button
    @click="toggle"
    type="button"
    class="toggle-switch"
    :class="{ active: modelValue }"
    role="switch"
    :aria-checked="modelValue"
  >
    <span class="toggle-slider"></span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped>
.toggle-switch {
  @apply relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300 dark:bg-gray-600;
}

.toggle-switch.active {
  @apply bg-blue-600;
}

.toggle-slider {
  @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1;
}

.toggle-switch.active .toggle-slider {
  @apply translate-x-6;
}

.toggle-switch:focus {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2;
}
</style>
