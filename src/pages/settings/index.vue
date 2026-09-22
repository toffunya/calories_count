<script setup lang="ts">
import type { Profile } from '@/shared/db';
import {
  ActivityIcon,
  ChevronRightIcon,
  CircleUserRoundIcon,
  DatabaseIcon,
  FlameIcon,
  LanguagesIcon,
  Settings2Icon,
  SparklesIcon,
  UtensilsIcon,
  WeightIcon,
} from '@lucide/vue';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { loadProfile } from '@/entities/profile';
import { formatNumber, useLiveQuery, useLocale } from '@/shared/lib';

const profile = useLiveQuery<Profile | undefined>(() => loadProfile(), undefined);
const { isEnglish, locale } = useLocale();

const copy = computed(() => isEnglish.value
  ? {
      title: 'Profile',
      eyebrow: 'Nutrition profile',
      local: 'Stored on this device',
      daily: 'Daily target',
      weight: 'Weight',
      age: 'Age',
      years: 'years',
      plan: 'Your plan',
      activity: 'Activity',
      goal: 'Goal',
      settings: 'Settings',
      settingsHint: 'Target, personal data and language',
      foods: 'My dishes',
      foodsHint: 'Create and edit your own foods',
      data: 'Data & privacy',
      dataHint: 'Backups and local storage',
      noAuth: 'No account needed',
      noAuthHint: 'Your profile and diary stay on this device.',
    }
  : {
      title: 'Профиль',
      eyebrow: 'Профиль питания',
      local: 'Хранится на устройстве',
      daily: 'Дневная цель',
      weight: 'Вес',
      age: 'Возраст',
      years: 'лет',
      plan: 'Твой план',
      activity: 'Активность',
      goal: 'Цель',
      settings: 'Настройки',
      settingsHint: 'Норма, параметры и язык',
      foods: 'Мои блюда',
      foodsHint: 'Создание и редактирование блюд',
      data: 'Данные и приватность',
      dataHint: 'Резервная копия и хранение',
      noAuth: 'Без регистрации',
      noAuthHint: 'Профиль и дневник остаются на этом устройстве.',
    });

const activityLabel = computed(() => {
  const labels = isEnglish.value
    ? { sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', high: 'High', veryHigh: 'Very high' }
    : { sedentary: 'Сидячая', light: 'Лёгкая', moderate: 'Умеренная', high: 'Высокая', veryHigh: 'Очень высокая' };

  return profile.value ? labels[profile.value.activity] : '—';
});

const goalLabel = computed(() => {
  const labels = isEnglish.value
    ? { cut: 'Lose weight', cutMild: 'Gentle loss', maintain: 'Maintain', bulkMild: 'Gentle gain', bulk: 'Gain weight' }
    : { cut: 'Похудение', cutMild: 'Мягкое похудение', maintain: 'Поддержание', bulkMild: 'Мягкий набор', bulk: 'Набор массы' };

  return profile.value ? labels[profile.value.goal] : '—';
});

const menu = computed(() => [
  { to: '/settings/preferences', icon: Settings2Icon, label: copy.value.settings, hint: copy.value.settingsHint, tone: 'blue' },
  { to: '/settings/foods', icon: UtensilsIcon, label: copy.value.foods, hint: copy.value.foodsHint, tone: 'orange' },
  { to: '/settings/preferences#data', icon: DatabaseIcon, label: copy.value.data, hint: copy.value.dataHint, tone: 'green' },
]);
</script>

<template>
  <main class="scrollbar-none min-h-0 flex-1 overflow-y-auto bg-[#0c0e11] px-4 pt-4 pb-28 text-white">
    <header class="flex items-center justify-between">
      <div>
        <p class="text-[11px] font-semibold tracking-[0.14em] text-[#717987] uppercase">{{ copy.eyebrow }}</p>
        <h1 class="mt-1 text-[22px] font-bold tracking-[-0.025em]">{{ copy.title }}</h1>
      </div>
      <div class="grid size-11 place-items-center rounded-2xl bg-[#171b21] text-[#64aaff] ring-1 ring-white/8">
        <CircleUserRoundIcon class="size-6" />
      </div>
    </header>

    <section v-if="profile" class="mt-5 overflow-hidden rounded-[24px] border border-white/8 bg-[#171b21]">
      <div class="relative px-5 pt-5 pb-4">
        <div class="absolute top-0 right-0 size-28 rounded-full bg-[#258cff]/12 blur-3xl" />
        <div class="relative flex items-start justify-between gap-4">
          <div>
            <div class="mb-3 flex size-12 items-center justify-center rounded-[17px] bg-[#15355b] text-[#64aaff]">
              <SparklesIcon class="size-6" />
            </div>
            <p class="text-xs text-[#8d95a2]">{{ copy.daily }}</p>
            <p class="mt-1 text-[34px] font-bold leading-none tracking-[-0.04em] tabular-nums">
              {{ formatNumber(profile.targetKcal) }} <span class="text-sm font-semibold tracking-normal text-[#a8afb9]">kcal</span>
            </p>
          </div>
          <span class="rounded-full bg-[#182c22] px-3 py-1.5 text-[10px] font-bold text-[#71e18f]">{{ copy.local }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 border-t border-white/7">
        <div class="flex items-center gap-3 px-4 py-4">
          <WeightIcon class="size-[18px] text-[#fb9b52]" />
          <div>
            <p class="text-[10px] text-[#747c88]">{{ copy.weight }}</p>
            <p class="mt-0.5 text-sm font-semibold tabular-nums">{{ profile.weightKg }} kg</p>
          </div>
        </div>
        <div class="flex items-center gap-3 border-l border-white/7 px-4 py-4">
          <FlameIcon class="size-[18px] text-[#64aaff]" />
          <div>
            <p class="text-[10px] text-[#747c88]">{{ copy.age }}</p>
            <p class="mt-0.5 text-sm font-semibold tabular-nums">{{ profile.age }} {{ copy.years }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="profile" class="mt-4 rounded-[22px] border border-white/8 bg-[#14171c] p-4">
      <p class="text-xs font-bold text-[#aeb5bf]">{{ copy.plan }}</p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <div class="rounded-2xl bg-white/[0.035] p-3">
          <ActivityIcon class="size-[18px] text-[#64aaff]" />
          <p class="mt-3 text-[10px] text-[#747c88]">{{ copy.activity }}</p>
          <p class="mt-1 truncate text-xs font-semibold">{{ activityLabel }}</p>
        </div>
        <div class="rounded-2xl bg-white/[0.035] p-3">
          <FlameIcon class="size-[18px] text-[#fb9b52]" />
          <p class="mt-3 text-[10px] text-[#747c88]">{{ copy.goal }}</p>
          <p class="mt-1 truncate text-xs font-semibold">{{ goalLabel }}</p>
        </div>
      </div>
    </section>

    <nav class="mt-4 overflow-hidden rounded-[22px] border border-white/8 bg-[#14171c]">
      <RouterLink
        v-for="(item, index) in menu"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-white/5"
        :class="index ? 'border-t border-white/7' : ''"
      >
        <span
          class="grid size-9 shrink-0 place-items-center rounded-xl"
          :class="item.tone === 'blue' ? 'bg-[#15355b] text-[#64aaff]' : item.tone === 'orange' ? 'bg-[#352317] text-[#fb9b52]' : 'bg-[#182c22] text-[#71e18f]'"
        >
          <component :is="item.icon" class="size-[18px]" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold">{{ item.label }}</span>
          <span class="mt-0.5 block truncate text-[11px] text-[#777f8c]">{{ item.hint }}</span>
        </span>
        <ChevronRightIcon class="size-4 text-[#555c66]" />
      </RouterLink>
    </nav>

    <section class="mt-4 flex items-center gap-3 rounded-[20px] border border-white/7 bg-[#111419] px-4 py-3.5">
      <LanguagesIcon class="size-5 text-[#8d95a2]" />
      <div class="flex-1">
        <p class="text-xs font-semibold">{{ copy.noAuth }}</p>
        <p class="mt-0.5 text-[10px] leading-4 text-[#747c88]">{{ copy.noAuthHint }}</p>
      </div>
      <span class="text-[10px] font-bold text-[#64aaff] uppercase">{{ locale }}</span>
    </section>
  </main>
</template>
