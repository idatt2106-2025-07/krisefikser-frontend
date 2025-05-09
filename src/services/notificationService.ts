import axiosInstance from '@/services/axiosService'

class NotificationService {
  /**
   * Fetches expiring storage items from the server.
   *
   * @returns A promise that resolves to the data containing the expiring storage items.
   */
  async getExpiringStorageItems() {
    const response = await axiosInstance.get('/storage-items/household/expiring')
    return response.data
  }

  /**
   * Fetches incidents from the server.
   *
   * @returns A promise that resolves to the data containing the incidents.
   */
  async getIncidents(latitude: number, longitude: number) {
    const response = await axiosInstance.post('/notification/incidents', {
      latitude,
      longitude,
    })
    return response.data
  }
}

const notificationService = new NotificationService()
export default notificationService
