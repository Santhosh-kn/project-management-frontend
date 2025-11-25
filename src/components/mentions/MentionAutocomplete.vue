<template>
  <div class="mention-autocomplete" v-if="show" ref="dropdown">
    <div class="dropdown-menu show" :style="{ top: position.top + 'px', left: position.left + 'px' }">
      <div v-if="loading" class="dropdown-item disabled">
        <span class="spinner-border spinner-border-sm me-2"></span>
        Loading members...
      </div>
      <div v-else-if="filteredMembers.length === 0" class="dropdown-item disabled text-muted">
        No members found
      </div>
      <button
        v-else
        v-for="(member, index) in filteredMembers"
        :key="member.id"
        class="dropdown-item"
        :class="{ 'active': index === selectedIndex }"
        @click="selectMember(member)"
        @mouseenter="selectedIndex = index"
      >
        <i class="bi bi-person-circle me-2"></i>
        <strong>{{ member.name }}</strong>
        <small class="text-muted ms-2">{{ member.email }}</small>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export interface Member {
  id: number
  name: string
  email: string
}

interface Props {
  show: boolean
  members: Member[]
  loading?: boolean
  query: string
  position: {
    top: number
    left: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'select': [member: Member]
  'close': []
}>()

// State
const dropdown = ref<HTMLElement | null>(null)
const selectedIndex = ref(0)

// Computed
const filteredMembers = computed(() => {
  if (!props.query) return props.members

  const query = props.query.toLowerCase()
  return props.members.filter(member => 
    member.name.toLowerCase().includes(query) ||
    member.email.toLowerCase().includes(query)
  )
})

// Methods
const selectMember = (member: Member) => {
  emit('select', member)
  selectedIndex.value = 0
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.show || filteredMembers.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % filteredMembers.value.length
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = selectedIndex.value === 0 
        ? filteredMembers.value.length - 1 
        : selectedIndex.value - 1
      break
    case 'Enter':
      event.preventDefault()
      if (filteredMembers.value[selectedIndex.value]) {
        selectMember(filteredMembers.value[selectedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
  }
}

// Watch for query changes to reset selection
watch(() => props.query, () => {
  selectedIndex.value = 0
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.mention-autocomplete {
  position: relative;
  z-index: 1050;
}

.dropdown-menu {
  position: fixed;
  display: block;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  min-width: 300px;
}

.dropdown-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  white-space: nowrap;
}

.dropdown-item:hover,
.dropdown-item.active {
  background-color: #e9ecef;
}

.dropdown-item.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.dropdown-item strong {
  font-weight: 600;
}

.dropdown-item small {
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
