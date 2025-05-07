import axios from 'axios'

/**
 * Creates a pre-configured Axios instance for making HTTP requests to the backend API.
 *
 * @constant
 * @type {AxiosInstance}
 *
 * @property {string} baseURL - The base URL for the backend API.
 * @property {object} headers - Default headers for all requests, including `Content-Type: application/json`.
 * @property {boolean} withCredentials - Indicates whether cross-site Access-Control requests
 *                                        should be made using credentials such as cookies or authorization headers.
 */
const axiosInstance = axios.create({
  baseURL: 'http://dev.krisefikser.com:8080/api', // Dynamic base URL from the environment variable
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure credentials like cookies or authorization headers are sent
})

export default axiosInstance
