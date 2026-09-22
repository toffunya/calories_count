<script setup lang="ts">
import type { Entry, Profile } from '@/shared/db';
import type { DateKey } from '@/shared/lib';
import { ChevronLeftIcon, ChevronRightIcon, FlameIcon } from '@lucide/vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { entriesFrom, totalsByDate } from '@/entities/entry';
import { loadProfile } from '@/entities/profile';
import {
  formatNumber,
  formatWeekday,
  fromDateKey,
  shiftDateKey,
  startOfWeek,
  toDateKey,
  useLiveQuery,
  weekDateKeys,
} from '@/shared/lib';
import { summarizeWeek, weekTotals } from './lib/week';
import WeekChart from './ui/WeekChart.vue';

const router = useRouter();
const selectedWeek = ref(startOfWeek(toDateKey()));
const days = computed(() => weekDateKeys(selectedWeek.value));
const queryStart = computed(() => days.value[0]);

const entries = useLiveQuery<Entry[]>(() => entriesFrom(queryStart.value), [], [queryStart]);
const profile = useLiveQuery<Profile | undefined>(() => loadProfile(), undefined);

const target = computed(() => profile.value?.targetKcal ?? 0);
const dayTotals = computed(() => weekTotals(days.value, totalsByDate(entries.value)));
const summary = computed(() => summarizeWeek(dayTotals.value, target.value));
const isCurrentWeek = computed(() => selectedWeek.value === startOfWeek(toDateKey()));

const rangeLabel = computed(() => {
  const start = fromDateKey(days.value[0]);
  const end = fromDateKey(days.value[6]);
  const startText = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: start.getMonth() === end.getMonth() ? undefined : 'short',
  }).format(start).replace('.', '');
  const endText = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(end);

  return `${startText} — ${endText}`;
});

const periodLabel = computed(() => {
  if (isCurrentWeek.value) {
    return 'Эта неделя';
  }

  return selectedWeek.value === shiftDateKey(startOfWeek(toDateKey()), -7)
    ? 'Прошлая неделя'
    : rangeLabel.value;
});

function moveWeek(offset: number) {
  selectedWeek.value = shiftDateKey(selectedWeek.value, offset * 7);
}

function showDay(date: DateKey) {
  void router.push({ path: '/', query: { date } });
}
</script>

<template>
  <main class="scrollbar-none min-h-0 flex-1 overflow-y-auto bg-[#0c0e11] px-4 pt-3 pb-28 text-[#f7f8fa]">
    <header class="flex items-end justify-between">
      <div>
        <p class="text-[11px] font-semibold tracking-[0.12em] text-[#63aaff] uppercase">
          Insights
        </p>
        <h1 class="mt-0.5 text-[24px] leading-tight font-bold tracking-[-0.035em]">
          Твой прогресс
        </h1>
      </div>
      <div class="flex gap-1.5">
        <button
          type="button"
          aria-label="Предыдущая неделя"
          class="flex size-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#171a1f] text-[#c3c8d0] active:scale-95"
          @click="moveWeek(-1)"
        >
          <ChevronLeftIcon class="size-4.5" />
        </button>
        <button
          type="button"
          aria-label="Следующая неделя"
          :disabled="isCurrentWeek"
          class="flex size-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#171a1f] text-[#c3c8d0] active:scale-95 disabled:opacity-30"
          @click="moveWeek(1)"
        >
          <ChevronRightIcon class="size-4.5" />
        </button>
      </div>
    </header>

    <section class="mt-4 rounded-[24px] border border-white/[0.08] bg-[#171a1f] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-[16px] font-semibold tracking-[-0.02em]">
            {{ periodLabel }}
          </h2>
          <p class="mt-0.5 text-[12px] text-[#858b95]">
            {{ rangeLabel }}
          </p>
        </div>
        <div class="flex items-center gap-1.5 rounded-xl bg-[#122941] px-2.5 py-1.5 text-[11px] font-semibold text-[#63aaff]">
          <FlameIcon class="size-3.5" />
          {{ formatNumber(target) }} / день
        </div>
      </div>

      <WeekChart class="mt-2" :days="dayTotals" :target="target" @pick="showDay" />

      <p class="mt-3 text-center text-[11px] text-[#737984]">
        Нажми на день, чтобы открыть записи
      </p>
    </section>

    <section class="mt-3.5">
      <div class="mb-2.5 flex items-center justify-between">
        <h2 class="text-[16px] font-semibold tracking-[-0.02em]">
          Коротко о неделе
        </h2>
        <span class="text-[11px] text-[#737984]">
          {{ summary.trackedDays }} из 7 дней заполнено
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <article class="rounded-[18px] border border-white/[0.07] bg-[#171a1f] p-3">
          <p class="text-[10px] leading-3.5 text-[#858b95]">Среднее</p>
          <p class="mt-2 text-[18px] leading-none font-bold tabular-nums tracking-[-0.04em]">
            {{ formatNumber(summary.average) }}
          </p>
          <p class="mt-1 text-[10px] text-[#858b95]">ккал / день</p>
        </article>

        <article class="rounded-[18px] border border-white/[0.07] bg-[#171a1f] p-3">
          <p class="text-[10px] leading-3.5 text-[#858b95]">От цели</p>
          <p class="mt-2 text-[18px] leading-none font-bold tabular-nums tracking-[-0.04em] text-[#63aaff]">
            {{ summary.averagePercent }}%
          </p>
          <p class="mt-1 text-[10px] text-[#858b95]">в среднем</p>
        </article>

        <article class="rounded-[18px] border border-white/[0.07] bg-[#171a1f] p-3">
          <p class="text-[10px] leading-3.5 text-[#858b95]">Всего</p>
          <p class="mt-2 text-[18px] leading-none font-bold tabular-nums tracking-[-0.04em]">
            {{ formatNumber(summary.total) }}
          </p>
          <p class="mt-1 text-[10px] text-[#858b95]">ккал</p>
        </article>
      </div>

      <p class="mt-2.5 rounded-2xl bg-[#12151a] px-3 py-2.5 text-[11px] leading-4 text-[#858b95]">
        Среднее считается только по дням, где есть записи. Пустые дни не занижают результат.
      </p>
    </section>

    <section class="mt-4">
      <h2 class="text-[16px] font-semibold tracking-[-0.02em]">По дням</h2>
      <ul class="mt-2.5 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#171a1f]">
        <li
          v-for="day in dayTotals"
          :key="day.date"
          class="border-b border-white/[0.06] last:border-b-0"
        >
          <button
            type="button"
            class="flex w-full items-center gap-3 px-3.5 py-2.5 text-left active:bg-white/[0.04] disabled:opacity-35"
            :disabled="day.date > toDateKey()"
            @click="showDay(day.date)"
          >
            <span class="flex size-9 shrink-0 flex-col items-center justify-center rounded-xl bg-white/[0.045] text-[10px] leading-3 text-[#858b95]">
              <span class="uppercase">{{ formatWeekday(day.date).replace('.', '') }}</span>
              <span class="text-[13px] font-semibold text-[#f7f8fa]">{{ fromDateKey(day.date).getDate() }}</span>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-[13px] font-medium">
                {{ day.kcal ? `${formatNumber(day.kcal)} ккал` : 'Нет записей' }}
              </span>
              <span class="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  class="block h-full rounded-full bg-[#2d91ff]"
                  :class="day.kcal > target && target > 0 ? 'bg-[#ff9f43]' : ''"
                  :style="{ width: `${Math.min(target ? day.kcal / target * 100 : 0, 100)}%` }"
                />
              </span>
            </span>
            <span class="w-[66px] text-right text-[10px] leading-3.5 text-[#858b95]">
              <template v-if="day.kcal && target">
                {{ day.kcal <= target ? `${formatNumber(target - day.kcal)} до цели` : `${formatNumber(day.kcal - target)} выше` }}
              </template>
              <template v-else>—</template>
            </span>
          </button>
        </li>
      </ul>
    </section>
  </main>
</template>
