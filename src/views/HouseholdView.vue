<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import SidebarContent from '../components/SidebarContent.vue';

/**
 * Interface representing a sidebar item.
 * @interface
 * @property {string} id - Unique identifier for the sidebar item.
 * @property {string} title - Display title of the sidebar item.
 */
interface SidebarItem {
  id: string;
  title: string;
}

/**
 * Interface representing a household member.
 * @interface
 * @property {string} name - Name of the household member.
 */
interface Member {
  name: string;
}

/**
 * Reactive array of sidebar menu items.
 * @type {Ref<SidebarItem[]>}
 */
const menuItems = ref<SidebarItem[]>([
  {
    id: 'household',
    title: 'Household'
  },
  {
    id: 'group',
    title: 'Group'
  }
]);

/**
 * Reactive state to track the currently active popup member.
 * @type {Ref<string | null>}
 */
const activePopupMember = ref<string | null>(null);

/**
 * Handles the selection of a sidebar item.
 * @param {SidebarItem} item - The selected sidebar item.
 * @param {number} index - The index of the selected item.
 */
const handleItemSelected = (item: SidebarItem, index: number) => {
  console.log('Selected item:', item.title, 'at index:', index);
};

/**
 * Reactive array of household members.
 * @type {Ref<Member[]>}
 */
const members = ref<Member[]>([]);

/**
 * Reactive state to track the loading status.
 * @type {Ref<boolean>}
 */
const isLoading = ref(true);

/**
 * Reactive state to store error messages.
 * @type {Ref<string | null>}
 */
const error = ref<string | null>(null);

/**
 * Fetches the list of household members.
 * Simulates an API call with a delay.
 * @async
 */
const fetchMembers = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    //TODO: fix to use endpoint later
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Populate members with mock data
    members.value = [
      { name: 'Anders Lundemo' },
      { name: 'Lukas' },
      { name: 'Johan' },
      { name: 'john doe' },
      { name: 'Vetle' },
      { name: 'Florian' }
    ];
  } catch (e) {
    // Handle errors and set error message
    error.value = 'Failed to load household members';
    console.log(e);
  } finally {
    // Set loading state to false
    isLoading.value = false;
  }
};

/**
 * Handles the edit action for a household member.
 * Toggles the popup for the selected member.
 * @param {Member} member - The member to be edited.
 * @param {Event} event - The click event.
 */
const editMember = (member: Member, event: Event) => {
  // Stop event propagation to prevent immediate closing
  event.stopPropagation();

  // Toggle popup for this member
  if (activePopupMember.value === member.name) {
    activePopupMember.value = null;
  } else {
    activePopupMember.value = member.name;
  }
};

/**
 * Closes all active popups.
 */
const closePopups = () => {
  activePopupMember.value = null;
};

/**
 * Lifecycle hook that runs when the component is mounted.
 * - Fetches the list of members.
 * - Adds a click event listener to close popups.
 */
onMounted(() => {
  fetchMembers();
  document.addEventListener('click', closePopups);
});

/**
 * Lifecycle hook that runs before the component is unmounted.
 * - Removes the click event listener to close popups.
 */
onBeforeUnmount(() => {
  document.removeEventListener('click', closePopups);
});
</script>

<template>
  <div class="page-container">
    <div class="content-container">
      <div class="sidebar-wrapper">
        <SidebarContent
          sidebar-title="Household"
          :sidebar-items="menuItems"
          @item-selected="handleItemSelected"
          class="sidebar-component"
        >
          <!-- Define content for each sidebar item using named slots -->
          <template #household>
            <button>Invite user</button>
            <h1></h1>
            <button>Add member without user</button>
            <div class="household-content">
              <h3>Members ⋅ {{ members.length  }}</h3>
              <hr>
              <div v-if="isLoading" class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading members...</p>
              </div>

              <div v-else-if="error" class="error-container">
                <p>{{ error }}</p>
                <button class="retry-button" @click="fetchMembers">Try again</button>
              </div>

              <div v-else class="members-list">
                <div v-for="member in members" :key="member.name" class="member-card">
                  <span>{{  member.name  }}</span>
                  <div class="edit-container">
                  <button class="edit-button" @click="editMember(member, $event)">
                    •••
                  </button>
                  <div v-if="activePopupMember === member.name" class="member-popup">
                    <div class="popup-option">Delete member</div>
                    <div class="popup-option">Show position</div>
                  </div>
                  </div>
                </div>
                <button class="leave-household">leave household</button>
              </div>
            </div>
          </template>

          <template #group>
            <div class="group-content">
              <span>groups</span>
            </div>
          </template>
        </SidebarContent>
      </div>
    </div>
  </div>
</template>

<style scoped>

.page-container {
  min-height: 100vh;
  background-color: var(--background-color);
  padding: 24px;
}

.content-container {
  max-width: 896px;
  margin: 0 auto;
}

.sidebar-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sidebar-component {
  height: 800px;
}

.household-content ul {
  margin: 20px 0;
  padding-left: 20px;
}

.household-content li {
  margin-bottom: 8px;
}

.leave-household{
  background-color: var(--danger-color);
  margin-bottom: 20px;
}

.leave-household:hover{
  background-color: rgb(186, 0, 0);
}

h3{
  margin-bottom: 0;
}

.group-item h3 {
  margin: 0 0 8px 0;
}

.member-card {
  display: flex;
  padding: 8px;
  border: 1px solid #444343;
  border-radius: 6px;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  transition: background-color 0.2s;
  margin-bottom: 10px;
}

.edit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 15px;
  border-color: #0ea5e9;
  background-color: #c1c1c1;
  color: #000000;
  cursor: pointer;
  margin-left: 12px;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: #0ea5e9;
  color: white;
}

.loading-spinner {
  border: 3px solid #f3f4f6;
  border-top: 3px solid #0ea5e9;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1.5s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mobile-menu-button span {
  height: 3px;
  width: 100%;
  background-color: #333;
  border-radius: 3px;
}

.edit-container {
  position: relative;
  display: flex;
  align-items: center;
}

.member-popup {
  position: absolute;
  top: 0;
  right: 100%;
  margin-right: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 100;
  min-width: 150px;
}

.popup-option {
  padding: 10px 16px;
  font-family: 'Roboto', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #eee;
}

.popup-option:hover {
  background-color: #f5f5f5;
}

.popup-option:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {

  .member-popup {
    right: 0;
    top: 100%;
    margin-top: 4px;
    margin-right: 0;
  }

  .member-card {
    padding: 12px 8px;
  }

  .edit-button {
    width: 28px;
    height: 28px;
    margin-left: 8px;
  }
}

@media (max-width: 480px) {
  .content-container {
    padding: 8px;
  }

  .sidebar-wrapper {
    border-radius: 4px;
  }

  h3 {
    font-size: 1.2rem;
  }

  .page-container {
    padding: 12px;
  }
}
</style>
