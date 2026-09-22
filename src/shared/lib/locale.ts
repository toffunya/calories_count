import { computed, ref } from 'vue';

export type AppLocale = 'ru' | 'en';

const STORAGE_KEY = 'calories-count-locale';
const stored = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY);
const locale = ref<AppLocale>(stored === 'en' ? 'en' : 'ru');

export function setLocale(next: AppLocale) {
  locale.value = next;

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, next);
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = next;
  }
}

export function useLocale() {
  return {
    locale: computed(() => locale.value),
    isEnglish: computed(() => locale.value === 'en'),
    setLocale,
  };
}
