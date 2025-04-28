import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import UserSettingsView from '@/views/UserSettingsView.vue'
import HouseholdView from '@/views/HouseholdView.vue'
import AdminView from '@/views/AdminView.vue'
import QuizCreator from '@/views/QuizCreator.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: UserSettingsView,
    },
    {
      path: '/household',
      name: 'household',
      component: HouseholdView,
    }
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      path: '/quiz-creator',
      name: 'quiz-creator',
      component: QuizCreator,
    },
  ],
})

export default router
