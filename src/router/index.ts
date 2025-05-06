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
import AddPOIView from '@/views/admin/AddPOIView.vue'
import AddAffectedAreaView from '@/views/admin/AddAffectedAreaView.vue'

// Components
import QuizCreator from '@/views/admin/QuizCreator.vue'

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
      path: '/admin/add/poi',
      name: 'AddPOI',
      component: AddPOIView,
    },
    {
      path: '/admin/add/affected-area',
      name: 'AddAffectedArea',
      component: AddAffectedAreaView,
    },
  ],
})

export default router
