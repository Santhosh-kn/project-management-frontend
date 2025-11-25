<template>
  <div class="app-container">
    <Sidebar ref="sidebarRef" @toggle="handleSidebarToggle" />
    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <Navbar @toggle-sidebar="toggleSidebar" />
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/common/Sidebar.vue'
import Navbar from '@/components/common/Navbar.vue'

const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebar()
}

const handleSidebarToggle = (collapsed: boolean) => {
  sidebarCollapsed.value = collapsed
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: var(--main-bg);
}

.main-content {
  margin-left: var(--sidebar-width);
  padding-top: var(--navbar-height);
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-collapsed {
  margin-left: 70px;
}

.content-wrapper {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 0;
  }
}
</style>
