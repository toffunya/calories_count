<script setup lang="ts">
import type { Profile } from '@/shared/db';
import type { AppLocale } from '@/shared/lib';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  DatabaseIcon,
  FlameIcon,
  InfoIcon,
  LanguagesIcon,
  SlidersHorizontalIcon,
  UserRoundIcon,
} from '@lucide/vue';
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { loadProfile } from '@/entities/profile';
import { formatNumber, setLocale, useLiveQuery, useLocale } from '@/shared/lib';
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
  <main class="scrollbar-none min-h-0 flex-1 overflow-y-auto bg-[#0c0e11] px-4 pt-3 pb-28 text-white">
    <header class="flex items-center gap-3 py-1">
      <RouterLink
        to="/settings"
        :aria-label="copy.back"
        class="grid size-10 place-items-center rounded-2xl border border-white/8 bg-[#171b21] text-[#aab1bc] active:scale-95"
      >
        <ArrowLeftIcon class="size-5" />
      </RouterLink>
      <h1 class="text-[21px] font-bold tracking-[-0.025em]">{{ copy.title }}</h1>
    </header>

    <section class="mt-4 rounded-[22px] border border-white/8 bg-[#15181d] p-4">
      <div class="flex items-center gap-3">
        <span class="grid size-9 place-items-center rounded-xl bg-[#15355b] text-[#64aaff]">
          <LanguagesIcon class="size-[18px]" />
        </span>
        <div>
          <h2 class="text-sm font-semibold">{{ copy.language }}</h2>
          <p class="mt-0.5 text-[11px] text-[#777f8c]">{{ copy.languageHint }}</p>
        </div>
      </div>
      <div class="mt-4 grid grid-cols-2 rounded-[14px] bg-[#0d1014] p-1">
        <button
          v-for="option in ([{ id: 'ru', label: copy.russian }, { id: 'en', label: copy.english }] as const)"
          :key="option.id"
          type="button"
          class="h-10 rounded-[11px] text-xs font-bold transition-all"
          :class="locale === option.id ? 'bg-[#278cff] text-white shadow-[0_6px_18px_rgba(39,140,255,0.25)]' : 'text-[#777f8c]'"
          @click="chooseLanguage(option.id)"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <p class="mt-6 mb-2 px-1 text-[10px] font-bold tracking-[0.15em] text-[#666e79] uppercase">{{ copy.nutrition }}</p>

    <section v-if="profile" class="overflow-hidden rounded-[22px] border border-white/8 bg-[#15181d]">
      <button data-testid="target-settings" type="button" class="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-white/5" @click="toggle('target')">
        <span class="grid size-9 place-items-center rounded-xl bg-[#352317] text-[#fb9b52]">
          <FlameIcon class="size-[18px]" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold">{{ copy.target }}</span>
          <span class="mt-0.5 block text-[11px] text-[#777f8c]">{{ formatNumber(profile.targetKcal) }} {{ copy.kcal }} · {{ copy.targetHint }}</span>
        </span>
        <ChevronDownIcon class="size-4 text-[#5d6570] transition-transform" :class="openSection === 'target' ? 'rotate-180' : ''" />
      </button>
      <div v-if="openSection === 'target'" class="border-t border-white/7 px-4 py-4">
        <TargetSection :profile="profile" />
      </div>

      <button data-testid="profile-settings" type="button" class="flex w-full items-center gap-3 border-t border-white/7 px-4 py-4 text-left active:bg-white/5" @click="toggle('profile')">
        <span class="grid size-9 place-items-center rounded-xl bg-[#182c22] text-[#71e18f]">
          <UserRoundIcon class="size-[18px]" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold">{{ copy.personal }}</span>
          <span class="mt-0.5 block text-[11px] text-[#777f8c]">{{ profile.weightKg }} kg · {{ profile.heightCm }} cm · {{ copy.personalHint }}</span>
        </span>
        <ChevronDownIcon class="size-4 text-[#5d6570] transition-transform" :class="openSection === 'profile' ? 'rotate-180' : ''" />
      </button>
      <div v-if="openSection === 'profile'" class="border-t border-white/7 px-4 py-4">
        <ProfileSection :profile="profile" />
      </div>
    </section>

    <p class="mt-6 mb-2 px-1 text-[10px] font-bold tracking-[0.15em] text-[#666e79] uppercase">{{ copy.privacy }}</p>

    <section id="data" class="overflow-hidden rounded-[22px] border border-white/8 bg-[#15181d]">
      <button type="button" class="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-white/5" @click="toggle('data')">
        <span class="grid size-9 place-items-center rounded-xl bg-[#23283a] text-[#aeb9ff]">
          <DatabaseIcon class="size-[18px]" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold">{{ copy.privacy }}</span>
          <span class="mt-0.5 block text-[11px] text-[#777f8c]">{{ copy.privacyHint }}</span>
        </span>
        <ChevronDownIcon class="size-4 text-[#5d6570] transition-transform" :class="openSection === 'data' ? 'rotate-180' : ''" />
      </button>
      <div v-if="openSection === 'data'" class="border-t border-white/7 px-4 py-4">
        <DataSection />
      </div>

      <button type="button" class="flex w-full items-center gap-3 border-t border-white/7 px-4 py-4 text-left active:bg-white/5" @click="toggle('about')">
        <span class="grid size-9 place-items-center rounded-xl bg-[#20242a] text-[#a5acb6]">
          <InfoIcon class="size-[18px]" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold">{{ copy.about }}</span>
          <span class="mt-0.5 block text-[11px] text-[#777f8c]">{{ copy.aboutHint }}</span>
        </span>
        <ChevronDownIcon class="size-4 text-[#5d6570] transition-transform" :class="openSection === 'about' ? 'rotate-180' : ''" />
      </button>
      <div v-if="openSection === 'about'" class="border-t border-white/7 px-4 py-4">
        <AboutSection />
      </div>
    </section>

    <div class="mt-5 flex items-center justify-center gap-2 text-[10px] text-[#555d68]">
      <SlidersHorizontalIcon class="size-3.5" />
      Calories Count · v{{ version }}
    </div>
  </main>
</template>
