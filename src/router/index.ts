import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views
import HomeView from '@/views/home/HomeView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import UserSettingsView from '@/views/user/UserSettingsView.vue'
import HouseholdView from '@/views/household/HouseholdView.vue'
import StorageView from '@/views/storage/StorageView.vue'
import AdminView from '@/views/admin/AdminView.vue'
import GeneralInfo from '@/views/general/GeneralInfoView.vue'
import News from '@/views/news/NewsView.vue'
import AddStorageItemView from '@/views/storage/AddStorageItemView.vue'
import UpdateItemView from '@/views/storage/UpdateItemView.vue'
import AddItemView from '@/views/storage/AddItemView.vue'
import MapView from '@/views/map/MapView.vue'
import RegisterAdmin from '@/views/admin/RegisterAdmin.vue'
import AddPOIView from '@/views/admin/AddPOIView.vue'
import AddAffectedAreaView from '@/views/admin/AddAffectedAreaView.vue'
import verifyHouseholdInvitationView from '@/views/household/verifyHouseholdInvitationView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'
import SuperAdminView from '@/views/admin/SuperAdminView.vue'
import TwoFactorAuthView from '@/views/2fa/TwoFactorAuthView.vue'
import TwoFactorNotifyView from '@/views/2fa/TwoFactorNotifyView.vue'
import PrivacyPolicyView from '@/views/privacy-policy/PrivacyPolicyView.vue'
import NewsDetailView from '@/views/news/NewsDetailView.vue'

import VerifyEmailView from '@/views/auth/VerifyEmailView.vue'
import SpecificCrisisTimeView from '@/views/general/SpecificCrisisTimeView.vue'
import UpdatePOIView from '@/views/admin/UpdatePOIView.vue'
import UpdateAffectedAreaView from '@/views/admin/UpdateAffectedAreaView.vue'

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
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
    },
    {
      path: '/storage',
      name: 'storage',
      component: StorageView,
      meta: { requiresAuth: true },
    },
    {
      path: '/storage/add-storage-item',
      name: 'add-storage-item',
      component: AddStorageItemView,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/storage/add-item',
      name: 'add-item',
      component: AddItemView,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/storage/update/:itemId',
      name: 'update-item',
      component: UpdateItemView,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, role: 'admin' },
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
      meta: { requiresAuth: true, role: 'superadmin' },
    },
    {
      path: '/admin/add/poi',
      name: 'addPOI',
      component: AddPOIView,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/add/affected-area',
      name: 'addAffectedArea',
      component: AddAffectedAreaView,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/update/poi',
      name: 'updatePOI',
      component: UpdatePOIView,
      props: true,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/update/affected-area',
      name: 'updateAffectedArea',
      component: UpdateAffectedAreaView,
      props: true,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/invitation/verify',
      name: 'verifyinvitation',
      component: verifyHouseholdInvitationView,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    },
    {
      path: '/super-admin',
      name: 'super-admin',
      component: SuperAdminView,
      meta: { requiresAuth: true, role: 'superadmin' },
    },
    {
      path: '/verify-admin',
      name: 'two-factor-auth',
      component: TwoFactorAuthView,
    },
    {
      path: '/admin/2fa-notify',
      name: 'TwoFactorNotify',
      component: TwoFactorNotifyView,
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
    },
    {
      path: '/general-info/:time',
      name: 'general-info-time',
      component: SpecificCrisisTimeView,
      props: true,
    },
    {
      path: '/news/:id',
      name: 'NewsDetail',
      component: NewsDetailView,
    },
    {
      path: '/profile',
      name: 'UserProfile',
      component: HouseholdView,
      props: true,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    console.log(authStore.isLoggedIn)
    if (!authStore.isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    } else if (to.meta.role == 'admin' && !authStore.isAdmin && !authStore.isSuperAdmin) {
      next({ path: '/' })
    } else if (to.meta.role == 'superadmin' && !authStore.isSuperAdmin) {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
