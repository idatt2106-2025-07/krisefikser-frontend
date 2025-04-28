<script setup lang="ts">
/**
 * Reusable notification bar component for displaying alerts and warnings
 */
import { defineProps } from 'vue';

interface Notification {
  type: 'danger' | 'warning' | 'info';
  message: string;
}

defineProps({
  /**
   * Array of notification objects to display
   */
  notifications: {
    type: Array as () => Notification[],
    default: () => []
  }
});

/**
 * Gets the appropriate CSS class based on notification type
 */
const getNotificationClass = (type: string) => {
  return `notification-${type}`;
};

/**
 * Gets the appropriate icon class based on notification type
 */
const getIconClass = (type: string) => {
  return `notification-${type}-icon`;
};
</script>

<template>
  <div class="notification-bar">
    <div
      v-for="(notification, index) in notifications"
      :key="index"
      :class="['notification-item', getNotificationClass(notification.type)]"
    >
      <div :class="['notification-icon', getIconClass(notification.type)]"></div>
      <div class="notification-message">
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-bar {
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 10px;
  overflow: hidden;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.notification-danger {
  background-color: white;
  border-left: 4px solid #ff3b30;
}

.notification-warning {
  background-color: white;
  border-left: 4px solid #ff9500;
}

.notification-info {
  background-color: white;
  border-left: 4px solid #007aff;
}

.notification-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  position: relative;
}

.notification-danger-icon {
  background-color: #ff3b30;
}

.notification-danger-icon:before {
  content: "!";
  color: white;
  font-weight: bold;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.notification-warning-icon {
  background-color: #ff9500;
}

.notification-warning-icon:before {
  content: "!";
  color: white;
  font-weight: bold;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.notification-info-icon {
  background-color: #007aff;
}

.notification-info-icon:before {
  content: "i";
  color: white;
  font-weight: bold;
  font-style: italic;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.notification-message {
  flex-grow: 1;
  font-size: 1rem;
}
</style>
