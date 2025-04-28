<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

/**
 * Interface defining the structure of a sidebar item.
 * @interface SidebarItem
 * @property {string} id - Unique identifier for the sidebar item.
 * @property {string} title - Display title of the sidebar item.
 */
interface SidebarItem {
  id: string
  title: string
}

/**
 * Reactive state to track whether the mobile menu is open.
 * @type {Ref<boolean>}
 */
const isMobileMenuOpen = ref(false)

/**
 * Props passed to the component.
 * @property {string} [sidebarTitle='Dashboard'] - Title displayed in the sidebar header.
 * @property {SidebarItem[]} sidebarItems - Array of sidebar items to display.
 */
const props = withDefaults(
  defineProps<{
    sidebarTitle?: string
    sidebarItems: SidebarItem[]
  }>(),
  {
    sidebarTitle: 'Dashboard',
  },
)

/**
 * Emits events from the component.
 * @event item-selected - Emitted when a sidebar item is selected.
 * @param {SidebarItem} item - The selected sidebar item.
 * @param {number} index - The index of the selected item.
 */
const emit = defineEmits<{
  (e: 'item-selected', item: SidebarItem, index: number): void
}>()

/**
 * Reactive state to track the index of the currently active sidebar item.
 * @type {Ref<number|null>}
 */
const activeItemIndex = ref<number | null>(null)

/**
 * Computed property to get the currently active sidebar item.
 * @returns {SidebarItem|null} The active sidebar item or null if none is selected.
 */
const activeItem = computed<SidebarItem | null>(() => {
  return activeItemIndex.value !== null ? props.sidebarItems[activeItemIndex.value] : null
})

/**
 * Sets the active sidebar item and emits the `item-selected` event.
 * @param {number} index - The index of the item to activate.
 */
const setActiveItem = (index: number): void => {
  activeItemIndex.value = index
  emit('item-selected', props.sidebarItems[index], index)

  // Close the mobile menu if the screen width is less than 768px.
  if (window.innerWidth < 768) {
    toggleMobileMenu()
  }
}

/**
 * Toggles the visibility of the mobile menu.
 */
const toggleMobileMenu = (): void => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

/**
 * Lifecycle hook that runs when the component is mounted.
 * - Sets the first sidebar item as active by default if items are available.
 */
onMounted(() => {
  if (props.sidebarItems.length > 0) {
    setActiveItem(0)
  }
})
</script>

<template>
  <div class="sidebar-container">
    <!-- Mobile Menu Button -->
    <div class="mobile-menu-button" @click="toggleMobileMenu">
      <span></span><span></span><span></span>
    </div>

    <!-- Mobile overlay -->
    <div class="mobile-overlay" v-if="isMobileMenuOpen" @click="toggleMobileMenu"></div>

    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
      <!-- Mobile header with close button -->
      <!-- Sidebar Items -->
      <div class="sidebar-items">
        <button
          class="close-mobile-menu"
          @click="toggleMobileMenu"
          aria-label="Toggle mobile menu"
        ></button>
        <div
          v-for="(item, index) in sidebarItems"
          :key="item.id"
          class="sidebar-item"
          :class="{ active: activeItemIndex === index }"
          @click="setActiveItem(index)"
        >
          <span>{{ item.title }}</span>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-area">
      <div v-if="activeItem" class="content-wrapper">
        <h1 class="content-title">{{ activeItem.title }}</h1>
        <div class="content-body">
          <slot :name="activeItem.id" :item="activeItem"></slot>
        </div>
      </div>
      <div v-else class="empty-content">Select an item from the sidebar</div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-container {
  display: flex;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.sidebar {
  width: 256px;
  display: flex;
  flex-direction: column;
  border-right: 5px solid #c1c1c1;
}

.sidebar-items {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: white;
}

.sidebar-item {
  padding: 20px;
  border-bottom: 2px solid #c1c1c1;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar-item:hover {
  background-color: #f3f4f6;
}

.sidebar-item.active {
  background-color: rgba(14, 165, 233, 0.34);
}

.sidebar-item span {
  font-weight: 500;
}

.content-area {
  flex-grow: 1;
  padding: 32px;
  background-color: white;
}

.content-wrapper {
  height: 100%;
}

.content-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #1e293b;
}

.content-body {
  color: #4b5563;
}

.empty-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.sidebar-item {
  position: relative;
}

.sidebar-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #0ea5e9;
}

.content-area {
  flex-grow: 1;
  padding: 32px;
  background-color: white;
  overflow-y: auto;
}

.content-wrapper {
  height: 100%;
}

.mobile-menu-button {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 24px;
  margin: 16px;
  cursor: pointer;
}

.mobile-menu-button span {
  height: 3px;
  width: 100%;
  background-color: #333;
  border-radius: 3px;
}

.close-mobile-menu {
  display: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f3f4f6;
  color: #333;
  font-size: 20px;
  border: 1px solid #e5e7eb;
  padding: 0;
  margin: 16px 16px 16px auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  align-self: flex-end;
}

@media (max-width: 768px) {
  .close-mobile-menu {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .sidebar-container {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    z-index: 100;
    width: 80%;
    height: 100vh;
    transition: left 0.3s ease;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .mobile-menu-button {
    display: flex;
    z-index: 99;
  }

  .close-mobile-menu {
    display: block;
  }

  .content-area {
    width: 100%;
    padding: 16px;
  }
}

@media (max-width: 480px) {
  h3 {
    font-size: 1.2rem;
  }
}
</style>
