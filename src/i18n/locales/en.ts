// Source of truth for translation keys. Other locales must have exactly the same keys
// (enforced by the `Translations` type and by src/i18n/__tests__/i18n.test.ts).
const en = {
  common: {
    continue: 'Continue',
    back: 'Back',
    error: 'Something went wrong. Please try again.',
    mockBadge: 'Mock mode',
  },
  onboarding: {
    page1Title: 'Welcome',
    page1Body: 'This is a starter template. Replace this text with what your app does.',
    page2Title: 'Built to be changed',
    page2Body: 'Rename the app, swap the theme, and connect your own backend when you are ready.',
    page3Title: 'Ready when you are',
    page3Body: 'Everything works without accounts or keys, so you can start right away.',
    getStarted: 'Get started',
  },
  auth: {
    title: 'Sign in',
    subtitle: 'Use your email and a password.',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: 'Password (min. 6 characters)',
    signIn: 'Sign in',
    signUp: 'Create account',
    guest: 'Continue without account',
    invalidEmail: 'Please enter a valid email address.',
    invalidPassword: 'The password needs at least 6 characters.',
    confirmEmail: 'Check your inbox to confirm your email, then sign in.',
    mockHint: 'Mock mode: any email and password with 6+ characters works.',
  },
  tabs: {
    home: 'Home',
    ai: 'AI',
    settings: 'Settings',
  },
  home: {
    title: 'Home',
    subtitle: 'Your items',
    itemTitle: 'Item {{n}}',
    itemBody: 'Placeholder content. Replace with your own data.',
    proCard: 'Unlock Pro',
    proCardBody: 'See the paywall flow.',
  },
  ai: {
    title: 'Ask AI',
    placeholder: 'Type a question...',
    send: 'Send',
    empty: 'Answers appear here.',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    subscription: 'Subscription',
    statusPro: 'Pro',
    statusFree: 'Free',
    upgrade: 'Upgrade',
    restore: 'Restore purchases',
    restored: 'Purchases restored.',
    nothingToRestore: 'No purchases found.',
    account: 'Account',
    signedInAs: 'Signed in as {{email}}',
    guest: 'Guest',
    signOut: 'Sign out',
    services: 'Services',
    servicesHint: 'Change in src/config/services.ts',
    modeLive: 'live',
    modeMock: 'mock',
    version: 'Version {{version}}',
  },
  paywall: {
    title: 'Go Pro',
    subtitle: 'Unlock every feature.',
    benefit1: 'Unlimited usage',
    benefit2: 'Priority support',
    benefit3: 'Support development',
    buy: 'Buy {{title}} for {{price}}',
    noPackages: 'No plans available right now.',
    mockHint: 'Mock mode: buying unlocks Pro locally, no money is charged.',
    close: 'Not now',
    alreadyPro: 'You already have Pro.',
  },
} as const;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Translations = Widen<typeof en>;

export default en;
