<script setup lang="ts">
import type { DayTotal } from '../lib/week';
import type { DateKey } from '@/shared/lib';
import { cn } from 'shonk-ui';
import { computed } from 'vue';
import { dayNumber, formatNumber, formatWeekday, isFuture, isToday } from '@/shared/lib';
import { chartScale } from '../lib/week';

const props = defineProps<{ days: DayTotal[]; target: number }>();
const emit = defineEmits<{ pick: [date: DateKey] }>();
const scale = computed(() => chartScale(props.days, props.target));

function heightPercent(kcal: number): string {
  if (kcal <= 0) {
    return '0%';
  }

  return `${Math.max((kcal / scale.value) * 100, 5)}%`;
}
</script>

<template>
  <section aria-label="Калории за неделю">
    <div class="relative grid h-[158px] grid-cols-7 gap-2 pt-6">
      <div
        v-if="props.target > 0"
        class="pointer-events-none absolute inset-x-0 z-10 flex items-center"
        :style="{ bottom: heightPercent(props.target) }"
      >
        <span class="h-px flex-1 border-t border-dashed border-[#59606b]" />
        <span class="ml-2 rounded-md bg-[#2a3039] px-1.5 py-0.5 text-[9px] font-medium text-[#aeb4bd]">
          цель {{ formatNumber(props.target) }}
        </span>
      </div>

      <button
        v-for="day in props.days"
        :key="day.date"
        type="button"
        :disabled="isFuture(day.date)"
        :aria-label="`${formatWeekday(day.date)}, ${dayNumber(day.date)}, ${formatNumber(day.kcal)} ккал`"
        class="group relative flex min-w-0 items-end justify-center rounded-[10px] bg-white/[0.035] disabled:opacity-35"
        @click="emit('pick', day.date)"
      >
        <span
          v-if="day.kcal > 0"
          class="absolute inset-x-0 bottom-0 rounded-[9px] bg-[#2d91ff] transition-[height] duration-500 group-active:bg-[#63aaff]"
          :class="day.kcal > props.target && props.target > 0 ? 'bg-[#ff9f43]' : ''"
          :style="{ height: heightPercent(day.kcal) }"
        />
        <span
          v-if="day.kcal > 0"
          class="relative z-20 mb-2 -rotate-90 text-[9px] font-semibold tabular-nums text-white"
        >
          {{ formatNumber(day.kcal) }}
        </span>
      </button>
    </div>

    <div class="mt-2 grid grid-cols-7 gap-2" aria-hidden="true">
      <span
        v-for="day in props.days"
        :key="day.date"
        :class="cn(
          'flex flex-col items-center text-center text-[10px] leading-4',
          isToday(day.date) ? 'font-semibold text-[#63aaff]' : 'text-[#737984]',
        )"
      >
        <span class="uppercase">{{ formatWeekday(day.date).replace('.', '') }}</span>
        <span class="text-[12px] tabular-nums">{{ dayNumber(day.date) }}</span>
      </span>
    </div>
  </section>
</template>
