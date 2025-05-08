export interface UserInfo {
  email: string
  name: string
  role: 'ROLE_NORMAL' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN'
  householdLatitude: number
  householdLongitude: number
  sharingLocation: boolean
}
