export interface Onboarding {
  didCompleteTutorial: boolean
  didAgreeToTerms: boolean
  didCreatePIN: boolean
  didConsiderBiometry: boolean
}

export interface Preferences {
  useBiometry: boolean
  biometryPreferencesUpdated: boolean
  developerModeEnabled: boolean
}

export interface Lockout {
  displayNotification: boolean
}

export interface LoginAttempt {
  lockoutDate?: number
  servedPenalty: boolean
  loginAttempts: number
}

export interface Authentication {
  didAuthenticate: boolean
}

export interface DeepLink {
  activeDeepLink?: string
}

export interface State {
  onboarding: Onboarding
  authentication: Authentication
  lockout: Lockout
  loginAttempt: LoginAttempt
  preferences: Preferences
  deepLink: DeepLink
  loading: boolean
}
