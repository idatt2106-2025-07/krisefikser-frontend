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
import BeforeCrisisView from '@/views/general/BeforeCrisisView.vue'
import DuringCrisisView from '@/views/general/DuringCrisisView.vue'
import AfterCrisisView from '@/views/general/AfterCrisisView.vue'
import NewsDetailView from '@/views/news/NewsDetailView.vue'

// Components
import QuizCreator from '@/views/admin/QuizCreator.vue'

import VerifyEmailView from '@/views/auth/VerifyEmailView.vue'
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
      path: '/storage/add-storage-item',
      name: 'add-storage-item',
      component: AddStorageItemView,
    },
    {
      path: '/storage/add-item',
      name: 'add-item',
      component: AddItemView,
    },
    {
      path: '/storage/update/:itemId',
      name: 'update-item',
      component: UpdateItemView,
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
      path: '/admin/add/poi',
      name: 'addPOI',
      component: AddPOIView,
    },
    {
      path: '/admin/add/affected-area',
      name: 'addAffectedArea',
      component: AddAffectedAreaView,
    },
    {
      path: '/admin/update/poi',
      name: 'updatePOI',
      component: UpdatePOIView,
      props: true,
    },
    {
      path: '/admin/update/affected-area',
      name: 'updateAffectedArea',
      component: UpdateAffectedAreaView,
      props: true,
    },
    {
      path: '/invitation/verify',
      name: 'verifyinvitation',
      component: verifyHouseholdInvitationView,
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
      path: '/general-info/before-crisis',
      name: 'before-crisis',
      component: BeforeCrisisView,
    },
    {
      path: '/general-info/during-crisis',
      name: 'during-crisis',
      component: DuringCrisisView,
    },
    {
      path: '/general-info/after-crisis',
      name: 'after-crisis',
      component: AfterCrisisView,
    },
    {
      path: '/news/:id',
      name: 'NewsDetail',
      component: NewsDetailView,
    },
  ],
})

export default router
