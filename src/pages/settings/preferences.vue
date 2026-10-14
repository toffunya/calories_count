<script setup lang="ts">
import type { Profile } from '@/shared/db';
import type { AppLocale } from '@/shared/lib';
import {
  ChevronDownIcon,
  DatabaseIcon,
  FlameIcon,
  InfoIcon,
  LanguagesIcon,
  SlidersHorizontalIcon,
  UserRoundIcon,
} from '@lucide/vue';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { loadProfile } from '@/entities/profile';
import { formatNumber, setLocale, useLiveQuery, useLocale } from '@/shared/lib';
import PageHeader from '@/widgets/page-header/PageHeader.vue';
import AboutSection from './ui/AboutSection.vue';
import DataSection from './ui/DataSection.vue';
import ProfileSection from './ui/ProfileSection.vue';
import TargetSection from './ui/TargetSection.vue';

const profile = useLiveQuery<Profile | undefined>(() => loadProfile(), undefined);
const version = __APP_VERSION__;
const route = useRoute();
const { isEnglish, locale } = useLocale();
const openSection = ref<'target' | 'profile' | 'data' | 'about' | null>(route.hash === '#data' ? 'data' : null);

const copy = computed(() => isEnglish.value
  ? {
      title: 'Settings',
      back: 'Back to profile',
      language: 'Language',
      languageHint: 'App interface language',
      nutrition: 'Nutrition',
      target: 'Daily target',
      targetHint: 'Calories per day',
      personal: 'Personal data',
      personalHint: 'Body and activity',
      privacy: 'Data & privacy',
      privacyHint: 'Backup or erase data',
      about: 'About the app',
      aboutHint: 'Version and installation',
      russian: 'Русский',
      english: 'English',
      kcal: 'kcal',
    }
  : {
      title: 'Настройки',
      back: 'Назад в профиль',
      language: 'Язык',
      languageHint: 'Язык интерфейса приложения',
      nutrition: 'Питание',
      target: 'Дневная норма',
      targetHint: 'Калорий в день',
      personal: 'Личные данные',
      personalHint: 'Параметры тела и активность',
      privacy: 'Данные и приватность',
      privacyHint: 'Копия или удаление данных',
      about: 'О приложении',
      aboutHint: 'Версия и установка',
      russian: 'Русский',
      english: 'English',
      kcal: 'ккал',
    });

function chooseLanguage(next: AppLocale) {
  setLocale(next);
}

function toggle(section: 'target' | 'profile' | 'data' | 'about') {
  openSection.value = openSection.value === section ? null : section;
}
</script>

<template>
  <main class="scrollbar-none min-h-0 flex-1 overflow-y-auto bg-[var(--ios-background)] px-4 pt-3 pb-28 text-white">
    <PageHeader :title="copy.title" back-to="/settings" />

    <section class="mt-4 rounded-[16px] border border-white/8 bg-[var(--ios-surface)] p-4">
      <div class="flex items-center gap-3">
        <span class="grid size-9 place-items-center rounded-xl bg-[var(--ios-accent-tint)] text-[var(--ios-accent)]">
          <LanguagesIcon class="size-[18px]" />
        </span>
        <div>
          <h2 class="text-sm font-semibold">{{ copy.language }}</h2>
          <p class="mt-0.5 text-[12px] text-[var(--ios-secondary)]">{{ copy.languageHint }}</p>
        </div>
      </div>
      <div class="mt-4 grid grid-cols-2 rounded-[14px] bg-[var(--ios-background)] p-1">
        <button
          v-for="option in ([{ id: 'ru', label: copy.russian }, { id: 'en', label: copy.english }] as const)"
          :key="option.id"
          type="button"
          class="h-10 rounded-[11px] text-xs font-bold transition-all"
          :class="locale === option.id ? 'bg-[var(--ios-accent)] text-white shadow-[0_6px_18px_rgba(39,140,255,0.25)]' : 'text-[var(--ios-secondary)]'"
          @click="chooseLanguage(option.id)"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <p class="mt-6 mb-2 px-1 text-[12px] font-bold tracking-[0.15em] text-[var(--ios-secondary)] uppercase">{{ copy.nutrition }}</p>

    <section v-if="profile" class="overflow-hidden rounded-[16px] border border-white/8 bg-[var(--ios-surface)]">
      <button data-testid="target-settings" type="button" class="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-white/5" @click="toggle('target')">
        <span class="grid size-9 place-items-center rounded-xl bg-[var(--ios-orange-tint)] text-[var(--ios-orange)]">
          <FlameIcon class="size-[18px]" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold">{{ copy.target }}</span>
          <span class="mt-0.5 block text-[12px] text-[var(--ios-secondary)]">{{ formatNumber(profile.targetKcal) }} {{ copy.kcal }} · {{ copy.targetHint }}</span>
        </span>
        <ChevronDownIcon class="size-4 text-[var(--ios-secondary)] transition-transform" :class="openSection === 'target' ? 'rotate-180' : ''" />
      </button>
      <div v-if="openSection === 'target'" class="border-t border-white/7 px-4 py-4">
        <TargetSection :profile="profile" />
      </div>

      <button data-testid="profile-settings" type="button" class="flex w-full items-center gap-3 border-t border-white/7 px-4 py-4 text-left active:bg-white/5" @click="toggle('profile')">
        <span class="grid size-9 place-items-center rounded-xl bg-[var(--ios-green-tint)] text-[var(--ios-green)]">
          <UserRoundIcon class="size-[18px]" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold">{{ copy.personal }}</span>
          <span class="mt-0.5 block text-[12px] text-[var(--ios-secondary)]">{{ profile.weightKg }} kg · {{ profile.heightCm }} cm · {{ copy.personalHint }}</span>
        </span>
        <ChevronDownIcon class="size-4 text-[var(--ios-secondary)] transition-transform" :class="openSection === 'profile' ? 'rotate-180' : ''" />
      </button>
      <div v-if="openSection === 'profile'" class="border-t border-white/7 px-4 py-4">
        <ProfileSection :profile="profile" />
      </div>
    </section>

    <p class="mt-6 mb-2 px-1 text-[12px] font-bold tracking-[0.15em] text-[var(--ios-secondary)] uppercase">{{ copy.privacy }}</p>

    <section id="data" class="overflow-hidden rounded-[16px] border border-white/8 bg-[var(--ios-surface)]">
      <button type="button" class="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-white/5" @click="toggle('data')">
        <span class="grid size-9 place-items-center rounded-xl bg-[#23283a] text-[#aeb9ff]">
          <DatabaseIcon class="size-[18px]" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold">{{ copy.privacy }}</span>
          <span class="mt-0.5 block text-[12px] text-[var(--ios-secondary)]">{{ copy.privacyHint }}</span>
        </span>
        <ChevronDownIcon class="size-4 text-[var(--ios-secondary)] transition-transform" :class="openSection === 'data' ? 'rotate-180' : ''" />
      </button>
      <div v-if="openSection === 'data'" class="border-t border-white/7 px-4 py-4">
        <DataSection />
      </div>

      <button type="button" class="flex w-full items-center gap-3 border-t border-white/7 px-4 py-4 text-left active:bg-white/5" @click="toggle('about')">
        <span class="grid size-9 place-items-center rounded-xl bg-[var(--ios-elevated)] text-[var(--ios-secondary)]">
          <InfoIcon class="size-[18px]" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold">{{ copy.about }}</span>
          <span class="mt-0.5 block text-[12px] text-[var(--ios-secondary)]">{{ copy.aboutHint }}</span>
        </span>
        <ChevronDownIcon class="size-4 text-[var(--ios-secondary)] transition-transform" :class="openSection === 'about' ? 'rotate-180' : ''" />
      </button>
      <div v-if="openSection === 'about'" class="border-t border-white/7 px-4 py-4">
        <AboutSection />
      </div>
    </section>

    <div class="mt-5 flex items-center justify-center gap-2 text-[12px] text-[var(--ios-secondary)]">
      <SlidersHorizontalIcon class="size-3.5" />
      Calories Count · v{{ version }}
    </div>
  </main>
</template>
