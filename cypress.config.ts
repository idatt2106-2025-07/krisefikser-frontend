import { defineConfig } from 'cypress'
import codeCoverageTask from '@cypress/code-coverage/task'

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://dev.krisefikser.localhost:5173',
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config)
      return config
    },
  },
})
