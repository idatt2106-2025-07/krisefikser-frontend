<template>
  <div class="admin-panel">
    <div class="sidebar">
      <button
        v-for="item in menuItems"
        :key="item"
        :class="{ active: item === selectedItem }"
        @click="selectedItem = item"
      >
        {{ item }}
      </button>
    </div>

    <div class="content">
      <h2>{{ selectedItem }}</h2>
      <div class="actions">
        <button>Add shelter</button>
        <button>Remove shelter</button>
        <button>Save changes</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuItems: ['Shelters', 'Affected areas', 'Map icons', 'Gamification'],
      selectedItem: 'Shelters',
    }
  },
}
</script>

<style scoped>
.admin-panel {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  background-color: white;
  border-radius: 15px;
  border: 2px solid #000;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.sidebar {
  width: 180px;
  border-right: 2px solid #000;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;
  overflow: hidden;
}

.sidebar button {
  padding: 10px;
  border: none;
  background-color: white;
  cursor: pointer;
  text-align: left;
  font-weight: bold;
  border-bottom: 1px solid #ccc;
}

.sidebar button.active {
  background-color: orange;
  color: white;
}

.content {
  flex: 1;
  padding: 20px;
}

.map-placeholder {
  margin: 10px auto;
  width: 300px;
  height: 300px;
  border: 1px solid #ccc;
  background-color: #e0f3f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-placeholder img {
  width: 100%;
  height: auto;
}

.actions {
  margin-top: 15px;
}

.actions button {
  margin: 5px;
  padding: 8px 12px;
  background-color: #60d394;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
</style>
