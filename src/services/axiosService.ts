import axios from 'axios'

/**
 * Creates a pre-configured Axios instance for making HTTP requests to the backend API.
 *
 * @constant
 * @type {AxiosInstance}
 *
 * @property {string} baseURL - The base URL for the backend API (`http://localhost:8080/api`).
 * @property {object} headers - Default headers for all requests, including `Content-Type: application/json`.
 * @property {boolean} withCredentials - Indicates whether cross-site Access-Control requests
 *                                        should be made using credentials such as cookies or authorization headers.
 *
 * @remarks
 * This instance is configured to communicate with the backend server running locally on port 8080.
 *
 * @example
 * ```typescript
 * axiosInstance.get('/example-endpoint')
 *   .then(response => console.log(response.data))
 *   .catch(error => console.error(error));
 * ```
 */
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api', // Backend url
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export default axiosInstance
