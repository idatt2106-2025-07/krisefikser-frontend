import { createRouter, createWebHistory } from 'vue-router'

// Views
import HomeView from '@/views/home/HomeView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import UserSettingsView from '@/views/user/UserSettingsView.vue'
import HouseholdView from '@/views/household/HouseholdView.vue'
import StorageView from '@/views/storage/StorageView.vue'
import AdminView from '@/views/admin/AdminView.vue'
import GeneralInfo from '@/views/general/GeneralInfoView.vue'
import News from '@/views/home/NewsView.vue'
import MapView from '@/views/map/MapView.vue'
import RegisterAdmin from '@/views/RegisterAdmin.vue'
import verifyHouseholdInvitationView from '@/views/household/verifyHouseholdInvitationView.vue'

// Components
import QuizCreator from '@/views/admin/QuizCreator.vue'

import VerifyEmailView from '@/views/auth/VerifyEmailView.vue'

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
      path: '/map',
      name: 'map',
      component: MapView,
    },
    {
      path: '/household',
      name: 'household',
      component: HouseholdView,
    },
    {
      path: '/storage',
      name: 'storage',
      component: StorageView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      path: '/quiz-creator',
      name: 'quiz-creator',
      component: QuizCreator,
    },
    {
      path: '/general-info',
      name: 'general-info',
      component: GeneralInfo,
    },
    {
      path: '/news',
      name: 'news',
      component: News,
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: QuizCreator,
    },
    {
      path: '/verify-email',
      name: 'verifyEmail',
      component: VerifyEmailView,
    },
    {
      path: '/register-admin',
      name: 'register-admin',
      component: RegisterAdmin,
    },
    {
      path: '/invitation/verify',
      name: 'verifyinvitation',
      component: verifyHouseholdInvitationView,
    },
  ],
})

export default router
