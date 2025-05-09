<script setup lang="ts">
/**
 * Reusable notification bar component for displaying alerts and warnings
 */
import { ref, onMounted } from 'vue'
import notificationService from '@/services/notificationService'

interface Notification {
  type: 'danger' | 'warning' | 'info'
  message: string
  route?: string
}

interface Item {
  id: number
  name: string
  unit: string
  calories: number
  type: string
}

interface ExpiringItem {
  id: number
  expirationDate: string
  quantity: number
  householdId: number
  itemId: number
  item: Item
}

interface TypeGroupData {
  count: number
  earliestItem: ExpiringItem | null
  earliestDays: number
}

interface TypeGroups {
  FOOD: TypeGroupData
  DRINK: TypeGroupData
  ACCESSORIES: TypeGroupData
  [key: string]: TypeGroupData
}

interface Incident {
  message: string
}

const notifications = ref<Notification[]>([])

/**
 * Gets the appropriate CSS class based on notification type
 */
const getNotificationClass = (type: string) => {
  return `notification-${type}`
}

/**
 * Gets the appropriate icon class based on notification type
 */
const getIconClass = (type: string) => {
  return `notification-${type}-icon`
}

/**
 * Gets the current device location
 *
 * @returns A promise that resolves to the coordinates {latitude, longitude, usingFallback}
 */
const getCurrentLocation = async (): Promise<{
  latitude: number
  longitude: number
  usingFallback: boolean
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          usingFallback: false, // This is real geolocation data
        })
      },
      (error) => {
        console.error('Error getting location:', error)
        // Default fallback coordinates (e.g., for Norway)
        resolve({
          latitude: 59.9139, // Oslo latitude
          longitude: 10.7522, // Oslo longitude
          usingFallback: true, // This indicates we're using fallback data
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  })
}

/**
 * Fetches incidents from the notification service and converts them to notifications
 */
const fetchIncidents = async () => {
  try {
    // First check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser')
      return [] // No incidents without geolocation
    }

    // Try to get the current location
    let location
    try {
      location = await getCurrentLocation()

      // If using fallback location (location denied), don't show incidents
      if (location.usingFallback) {
        console.log('User denied geolocation, not showing incidents')
        return []
      }

      // Call the API with the location data
      const response = await notificationService.getIncidents(
        location.latitude,
        location.longitude,
      )

      if (!response || response.length === 0) {
        return []
      }

      const incidentNotifications = response.map((incident: Incident) => {
        return {
          type: 'danger' as const,
          message: incident.message,
          route: '/map',
        }
      })

      return incidentNotifications
    } catch (error) {
      console.error('Error getting location or fetching incidents:', error)
      return [] // Don't show error notification for location issues
    }
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return [] // Don't show incidents if there's an error
  }
}

/**
 * Fetches expiring storage items and converts them to notifications
 */
const fetchExpiringStorageItems = async () => {
  try {
    const response = await notificationService.getExpiringStorageItems()

    if (response.length === 0) {
      return []
    }

    const typeGroups: TypeGroups = {
      FOOD: { count: 0, earliestItem: null, earliestDays: Infinity },
      DRINK: { count: 0, earliestItem: null, earliestDays: Infinity },
      ACCESSORIES: { count: 0, earliestItem: null, earliestDays: Infinity },
      OTHER: { count: 0, earliestItem: null, earliestDays: Infinity },
    }

    response.forEach((item: ExpiringItem) => {
      const type = item.item.type.toUpperCase()
      const daysUntil = getDaysUntilExpiry(item.expirationDate)

      let groupKey = 'OTHER'
      if (typeGroups.hasOwnProperty(type)) {
        groupKey = type
      }

      typeGroups[groupKey].count++

      if (daysUntil < typeGroups[groupKey].earliestDays) {
        typeGroups[groupKey].earliestDays = daysUntil
        typeGroups[groupKey].earliestItem = item
      }
    })

    const typeNotifications: Notification[] = []

    if (typeGroups.FOOD.count > 0) {
      if (typeGroups.FOOD.count == 1) {
        typeNotifications.push({
          type: 'warning',
          message: `${typeGroups.FOOD.earliestItem?.item.name} expires in ${typeGroups.FOOD.earliestDays} days`,
          route: '/storage',
        })
      } else {
        typeNotifications.push({
          type: 'warning',
          message: `${typeGroups.FOOD.count} food items expires within 7 days, first item in ${typeGroups.FOOD.earliestDays} days`,
          route: '/storage',
        })
      }
    }

    if (typeGroups.DRINK.count > 0) {
      if (typeGroups.DRINK.count == 1) {
        typeNotifications.push({
          type: 'warning',
          message: `${typeGroups.DRINK.earliestItem?.item.name} needs to be changed in ${typeGroups.DRINK.earliestDays} days`,
          route: '/storage',
        })
      } else {
        typeNotifications.push({
          type: 'warning',
          message: `${typeGroups.DRINK.count} drinks needs to be changed in 7 days, first item in ${typeGroups.DRINK.earliestDays} days`,
          route: '/storage',
        })
      }
    }

    if (typeGroups.ACCESSORIES.count > 0) {
      if (typeGroups.ACCESSORIES.count == 1) {
        typeNotifications.push({
          type: 'warning',
          message: `${typeGroups.ACCESSORIES.earliestItem?.item.name} needs your attention in ${typeGroups.ACCESSORIES.earliestDays} days`,
          route: '/storage',
        })
      } else {
        typeNotifications.push({
          type: 'warning',
          message: `${typeGroups.ACCESSORIES.count} accessories needs your attention within 7 days, first item in ${typeGroups.ACCESSORIES.earliestDays} days`,
          route: '/storage',
        })
      }
    }

    notifications.value = typeNotifications
    return typeNotifications
  } catch (error) {
    console.error('Error fetching expiring items:', error)
    return []
  }
}

/**
 * Calculates the number of days until an item expires
 *
 * @param {string} expiryDateStr - The expiration date in string format
 * @returns {number} The number of days until the item expires
 */
const getDaysUntilExpiry = (expiryDateStr: string): number => {
  const expiryDate = new Date(expiryDateStr)
  const today = new Date()

  expiryDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Fetches all notifications by calling the incident and expiring items fetch functions
 */
const fetchAllNotifications = async () => {
  try {
    const [incidentNotifications, expiringItemsNotifications] = await Promise.all([
      fetchIncidents(),
      fetchExpiringStorageItems(),
    ])

    notifications.value = [...incidentNotifications, ...expiringItemsNotifications]
  } catch (error) {
    console.error('Error fetching notifications:', error)
    notifications.value = [
      {
        type: 'danger',
        message: 'Error loading notifications',
      },
    ]
  }
}

/**
 * Fetches all notifications when the component is mounted
 */
onMounted(() => {
  fetchAllNotifications()
})
</script>

<template>
  <div class="notification-bar">
    <div
      v-for="(notification, index) in notifications"
      :key="index"
      :class="['notification-item', getNotificationClass(notification.type)]"
      @click="notification.route && $router.push(notification.route)"
      :style="notification.route ? 'cursor: pointer' : ''"
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
  border-left: 4px solid #d70b00;
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
  background-color: #d70b00;
}

.notification-danger-icon:before {
  content: '⚠️';
  color: white;
  font-weight: bold;
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
}

.notification-warning-icon {
  background-color: #ff9500;
}

.notification-warning-icon:before {
  content: '!';
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
  content: 'i';
  color: white;
  font-weight: bold;
  font-style: italic;
  position: absolute;
  left: 45%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.notification-message {
  flex-grow: 1;
  font-size: 1rem;
}
</style>
