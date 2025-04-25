<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface Category {
  id: string;
  name: string;
}

const props = defineProps({
  categories: {
    type: Array as () => Category[],
    required: true
  },
  checkedCategories: {
    type: Array as () => string[],
    required: true
  },
  title: {
    type: String,
    default: 'Categories'
  },
  sidebarClass: {
    type: String,
    default: ''
  },
  headerClass: {
    type: String,
    default: ''
  },
  titleClass: {
    type: String,
    default: ''
  },
  clearButtonClass: {
    type: String,
    default: ''
  },
  listClass: {
    type: String,
    default: ''
  },
  itemClass: {
    type: String,
    default: ''
  },
  labelClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:checkedCategories', 'clear']);

const updateChecked = (event: Event, value: string) => {
  // Use proper type casting for the HTML input element
  const target = event.target as HTMLInputElement;
  const checked = target.checked;

  const newChecked = [...props.checkedCategories];

  if (checked && !newChecked.includes(value)) {
    newChecked.push(value);
  } else if (!checked && newChecked.includes(value)) {
    const index = newChecked.indexOf(value);
    newChecked.splice(index, 1);
  }

  emit('update:checkedCategories', newChecked);
};

const clearFilters = () => {
  emit('update:checkedCategories', []);
  emit('clear');
};
</script>

<template>
  <div :class="['filter-sidebar', sidebarClass]">
    <div :class="['filter-header', headerClass]">
      <h2 :class="['filter-title', titleClass]">{{ title }}</h2>
      <button :class="['clear-filters', clearButtonClass]" @click="clearFilters">Clear</button>
    </div>

    <div :class="['category-list', listClass]">
      <label
        v-for="category in categories"
        :key="category.id"
        :class="['category-item', itemClass]"
      >
        <input
          type="checkbox"
          :value="category.id"
          :checked="checkedCategories.includes(category.id)"
          @change="(event) => updateChecked(event, category.id)"
        >
        <span :class="labelClass">{{ category.name }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.filter-sidebar {
  width: 250px;
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-title {
  font-size: 1.5rem;
  margin: 0;
}

.clear-filters {
  background: transparent;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}

.clear-filters:hover {
  text-decoration: underline;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
</style>
