type AnalyticsParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const GTM_ID = import.meta.env.NEXT_PUBLIC_GTM_ID || '';

let gtmInitialized = false;
let lastPageViewKey = '';

const suppressedPathPrefixes = [
  '/report/latest',
  '/report/daily',
  '/debug/',
  '/api/',
  '/admin/',
  '/dashboard/internal',
  '/internal',
  '/dev',
];

function appendScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function initAnalytics() {
  if (shouldSuppressAnalytics()) return;
  initGTM();
}

export function initGTM() {
  if (gtmInitialized || !GTM_ID || shouldSuppressAnalytics()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });
  appendScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`, 'gtm-tag');
  gtmInitialized = true;
}

export function logEvent(eventName: string, params: AnalyticsParams = {}) {
  trackEvent(eventName, params);
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (shouldSuppressAnalytics()) return;
  initAnalytics();
  pushDataLayer(eventName, params);
}

export function logScreenView(screenName: string) {
  if (shouldSuppressAnalytics()) return;
  initAnalytics();
  const path = `/${screenName}`;
  const pageLocation = `${window.location.origin}${path}`;
  const pageViewKey = `${screenName}:${pageLocation}`;
  if (pageViewKey === lastPageViewKey) return;
  lastPageViewKey = pageViewKey;

  pushDataLayer('page_view', {
    page_title: screenName,
    page_location: pageLocation,
    page_path: path,
  });
}

export function setAnalyticsUser(userId: string | null, properties: AnalyticsParams = {}) {
  if (shouldSuppressAnalytics()) return;
  initAnalytics();
  pushDataLayer('set_user', {
    user_id: userId || undefined,
    user_properties: cleanParams(properties),
  });
}

export function logLogin(method = 'Google') {
  trackLogin(method);
}

export function logSignUp(method = 'Google') {
  trackSignUp(method);
}

export function logSearch(searchTerm: string, source: string) {
  logEvent('search', { search_term: searchTerm, source });
}

export function logSelectContent(contentType: string, contentId: string) {
  logEvent('select_content', {
    content_type: contentType,
    content_id: contentId,
  });
}

export function logGenerateLead(leadSource: string, value?: number) {
  logEvent('generate_lead', {
    lead_source: leadSource,
    value,
    currency: value === undefined ? undefined : 'USD',
  });
}

export function logShare(method: string, contentType: string, itemId: string) {
  logEvent('share', {
    method,
    content_type: contentType,
    item_id: itemId,
  });
}

export function logContact(method: string, source: string) {
  logEvent('contact', { method, source });
}

function cleanParams(params: AnalyticsParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

export function pushDataLayer(event: string, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...cleanParams(params),
  });
}

export function trackSignUp(method = 'Google') {
  trackEvent('sign_up', { method });
}

export function trackLogin(method = 'Google') {
  trackEvent('login', { method });
}

export function trackOnboardingStarted() {
  trackEvent('onboarding_started');
}

export function trackOnboardingCompleted() {
  trackEvent('onboarding_completed');
}

export function trackLogCreated() {
  trackEvent('log_created');
}

export function trackNoteCreated() {
  trackEvent('note_created');
}

export function trackFoodLogged() {
  trackEvent('food_logged');
}

export function trackActivityLogged() {
  trackEvent('activity_logged');
}

export function trackHealthNoteLogged() {
  trackEvent('health_note_logged');
}

export function trackAiSummaryRequested() {
  trackEvent('ai_summary_requested');
}

export function trackAiResponseSaved() {
  trackEvent('ai_response_saved');
}

export function trackReminderCreated() {
  trackEvent('reminder_created');
}

export function trackShare() {
  trackEvent('share');
}

export function trackDeleteAccount() {
  trackEvent('delete_account');
}

export function trackPremiumClick() {
  trackEvent('premium_click');
}

export function trackTrialStarted() {
  trackEvent('trial_started');
}

export function trackBeginCheckout() {
  trackEvent('begin_checkout');
}

export function trackSubscriptionStarted() {
  trackEvent('subscription_started');
}

export function trackPurchase() {
  trackEvent('purchase');
}

export function trackCancelSubscription() {
  trackEvent('cancel_subscription');
}

export function shouldSuppressAnalytics() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('ga_debug') === '1') return false;
  const path = window.location.pathname.toLowerCase();
  return suppressedPathPrefixes.some((prefix) => path.startsWith(prefix));
}
