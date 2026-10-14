<script setup lang="ts">
import type { Profile } from '@/shared/db';
import {
  ActivityIcon,
  CalendarClockIcon,
  ChevronRightIcon,
  DatabaseIcon,
  FlameIcon,
  LanguagesIcon,
  Settings2Icon,
  SparklesIcon,
  TargetIcon,
  UtensilsIcon,
  WeightIcon,
} from '@lucide/vue';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { healthyWeightRange, isMonthlyWeightDue, weightChange, weightHistory } from '@/entities/health';
import { loadProfile } from '@/entities/profile';
import { formatNumber, useLiveQuery, useLocale } from '@/shared/lib';
import PageHeader from '@/widgets/page-header/PageHeader.vue';
import StepsPanel from '@/widgets/steps/StepsPanel.vue';

const profile = useLiveQuery<Profile | undefined>(() => loadProfile(), undefined);
const weightRecords = useLiveQuery(() => weightHistory(), []);
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

const healthyRange = computed(() => profile.value && profile.value.age >= 20 ? healthyWeightRange(profile.value.heightCm) : undefined);
const monthlyWeightDue = computed(() => isMonthlyWeightDue(weightRecords.value));
const weightChanges = computed(() => [
  { label: isEnglish.value ? 'Week' : 'Неделя', value: weightChange(weightRecords.value, 7) },
  { label: isEnglish.value ? 'Month' : 'Месяц', value: weightChange(weightRecords.value, 30) },
  { label: isEnglish.value ? 'Year' : 'Год', value: weightChange(weightRecords.value, 365) },
]);
const goalDifference = computed(() => {
  if (!profile.value?.targetWeightKg)
    return undefined;
  return Math.round((profile.value.weightKg - profile.value.targetWeightKg) * 10) / 10;
});
const goalProgress = computed(() => {
  if (!profile.value?.targetWeightKg || !weightRecords.value.length)
    return 0;
  const start = weightRecords.value[0].kg;
  const fullDistance = Math.abs(start - profile.value.targetWeightKg);
  const remaining = Math.abs(profile.value.weightKg - profile.value.targetWeightKg);
  return fullDistance ? Math.max(0, Math.min(100, Math.round((1 - remaining / fullDistance) * 100))) : 100;
});

const menu = computed(() => [
  { to: '/settings/preferences', icon: Settings2Icon, label: copy.value.settings, hint: copy.value.settingsHint },
  { to: '/settings/foods', icon: UtensilsIcon, label: copy.value.foods, hint: copy.value.foodsHint },
  { to: '/settings/preferences#data', icon: DatabaseIcon, label: copy.value.data, hint: copy.value.dataHint },
]);
</script>

<template>
  <main class="scrollbar-none min-h-0 flex-1 overflow-y-auto bg-[var(--ios-background)] px-4 pt-4 pb-28 text-white">
    <PageHeader :title="copy.title" :show-back="false" />

    <section v-if="profile" class="mt-5 overflow-hidden rounded-[16px] border border-white/8 bg-[var(--ios-surface)]">
      <div class="relative px-5 pt-5 pb-4">
        <div class="relative flex items-start justify-between gap-4">
          <div>
            <p class="flex items-center gap-2 text-xs text-[var(--ios-secondary)]"><SparklesIcon class="size-4" aria-hidden="true" />{{ copy.daily }}</p>
            <p class="mt-1 text-[34px] font-bold leading-none tracking-[-0.04em] tabular-nums">
              {{ formatNumber(profile.targetKcal) }} <span class="text-sm font-semibold tracking-normal text-[var(--ios-secondary)]">kcal</span>
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 border-t border-white/7">
        <div class="flex items-center gap-3 px-4 py-4">
          <WeightIcon class="size-[18px] text-[var(--ios-secondary)]" />
          <div>
            <p class="text-[12px] text-[var(--ios-secondary)]">{{ copy.weight }}</p>
            <p class="mt-0.5 text-sm font-semibold tabular-nums">{{ profile.weightKg }} kg</p>
          </div>
        </div>
        <div class="flex items-center gap-3 border-l border-white/7 px-4 py-4">
          <FlameIcon class="size-[18px] text-[var(--ios-secondary)]" />
          <div>
            <p class="text-[12px] text-[var(--ios-secondary)]">{{ copy.age }}</p>
            <p class="mt-0.5 text-sm font-semibold tabular-nums">{{ profile.age }} {{ copy.years }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="profile" class="mt-4 rounded-[16px] border border-white/8 bg-[var(--ios-surface)] p-4">
      <div class="flex items-start gap-3">
        <span class="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[var(--ios-elevated)] text-[var(--ios-secondary)]">
          <TargetIcon class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-[12px] font-semibold text-[var(--ios-secondary)]">{{ isEnglish ? 'Weight goal' : 'Цель по весу' }}</p>
          <template v-if="profile.targetWeightKg">
            <div class="mt-1 flex items-end justify-between gap-3">
              <p class="text-[25px] leading-none font-bold tabular-nums">{{ profile.targetWeightKg }} кг</p>
              <p class="text-[12px] text-[var(--ios-secondary)]">
                {{ goalDifference && goalDifference > 0 ? `${isEnglish ? 'lose' : 'сбросить'} ${formatNumber(goalDifference)} кг` : goalDifference && goalDifference < 0 ? `${isEnglish ? 'gain' : 'набрать'} ${formatNumber(Math.abs(goalDifference))} кг` : isEnglish ? 'Goal reached' : 'Цель достигнута' }}
              </p>
            </div>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div class="h-full rounded-full bg-[var(--ios-accent)]" :style="{ width: `${goalProgress}%` }" />
            </div>
          </template>
          <RouterLink v-else to="/settings/preferences" class="mt-1 block text-xs font-semibold text-[var(--ios-accent)]">
            {{ isEnglish ? 'Set goal' : 'Задать цель' }}
          </RouterLink>
          <p v-if="healthyRange" class="mt-3 text-[12px] text-[var(--ios-secondary)]">
            {{ isEnglish ? 'BMI (20+)' : 'ИМТ (20+)' }}: {{ healthyRange.min }}–{{ healthyRange.max }} кг
          </p>
        </div>
      </div>
    </section>

    <StepsPanel :weight-kg="profile?.weightKg ?? 70" />

    <section v-if="profile" class="mt-4 rounded-[16px] border border-white/8 bg-[var(--ios-surface)] p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-bold text-[var(--ios-secondary)]">{{ isEnglish ? 'Weight history' : 'Динамика веса' }}</p>
        </div>
        <span v-if="monthlyWeightDue" class="flex items-center gap-1 rounded-[8px] bg-[var(--ios-elevated)] px-2.5 py-1 text-[12px] font-bold text-[var(--ios-secondary)]">
          <CalendarClockIcon class="size-3" />
          {{ isEnglish ? 'Measure now' : 'Пора измерить' }}
        </span>
      </div>
      <div class="mt-3 grid grid-cols-3 gap-2">
        <div v-for="item in weightChanges" :key="item.label" class="rounded-[8px] bg-[var(--ios-elevated)] px-3 py-3">
          <p class="text-[12px] text-[var(--ios-secondary)]">{{ item.label }}</p>
          <p class="mt-1 text-sm font-bold tabular-nums">
            {{ item.value === undefined ? '—' : `${item.value > 0 ? '+' : ''}${item.value} кг` }}
          </p>
        </div>
      </div>
    </section>

    <section v-if="profile" class="mt-4 rounded-[16px] border border-white/8 bg-[var(--ios-surface)] p-4">
      <p class="text-xs font-bold text-[var(--ios-secondary)]">{{ copy.plan }}</p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <div class="rounded-[8px] bg-[var(--ios-elevated)] p-3">
          <ActivityIcon class="size-[18px] text-[var(--ios-secondary)]" />
          <p class="mt-3 text-[12px] text-[var(--ios-secondary)]">{{ copy.activity }}</p>
          <p class="mt-1 truncate text-xs font-semibold">{{ activityLabel }}</p>
        </div>
        <div class="rounded-[8px] bg-[var(--ios-elevated)] p-3">
          <FlameIcon class="size-[18px] text-[var(--ios-secondary)]" />
          <p class="mt-3 text-[12px] text-[var(--ios-secondary)]">{{ copy.goal }}</p>
          <p class="mt-1 truncate text-xs font-semibold">{{ goalLabel }}</p>
        </div>
      </div>
    </section>

    <nav class="mt-4 overflow-hidden rounded-[16px] border border-white/8 bg-[var(--ios-surface)]">
      <RouterLink
        v-for="(item, index) in menu"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-white/5"
        :class="index ? 'border-t border-white/7' : ''"
      >
        <span class="grid size-9 shrink-0 place-items-center rounded-[8px] bg-[var(--ios-elevated)] text-[var(--ios-secondary)]">
          <component :is="item.icon" class="size-[18px]" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold">{{ item.label }}</span>
        </span>
        <ChevronRightIcon class="size-4 text-[var(--ios-secondary)]" />
      </RouterLink>
    </nav>

    <RouterLink to="/settings/preferences" class="mt-4 flex items-center justify-center gap-2 py-2 text-[12px] text-[var(--ios-secondary)]"><LanguagesIcon class="size-4" />{{ isEnglish ? 'On this device' : 'На этом устройстве' }} · <span class="uppercase">{{ locale }}</span></RouterLink>
  </main>
</template>
