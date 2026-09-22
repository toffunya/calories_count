<script setup lang="ts">
import type { DateKey } from '@/shared/lib';
import { useEventListener, useSwipe } from '@vueuse/core';
import { cn } from 'shonk-ui';
import { computed, onMounted, useTemplateRef, watch } from 'vue';
import {
  dayNumber,
  fromDateKey,
  isFuture,
  isToday,
  shiftDateKey,
  toDateKey,
} from '@/shared/lib';

const props = defineProps<{
  gestureArea?: HTMLElement | null;
  totals?: Map<DateKey, number>;
  target?: number;
}>();

const selected = defineModel<DateKey>({ required: true });

const HISTORY_WEEKS = 26;
const WHEEL_STEP_DELAY = 400;

const weeks = computed(() => {
  const result: DateKey[][] = [];
  let center = toDateKey();

  while (result.length < HISTORY_WEEKS || !result.some(week => week.includes(selected.value))) {
    result.unshift(Array.from({ length: 7 }, (_, index) => shiftDateKey(center, index - 3)));
    center = shiftDateKey(center, -7);
  }

  return result;
});

const selectedWeekIndex = computed(() => weeks.value.findIndex(week => week.includes(selected.value)));

const strip = useTemplateRef<HTMLElement>('strip');

function showSelectedWeek(behavior: ScrollBehavior) {
  const element = strip.value;

  if (element) {
    element.scrollTo({ left: selectedWeekIndex.value * element.clientWidth, behavior });
  }
}

function shiftSelectedDay(step: number) {
  const shifted = shiftDateKey(selected.value, step);

  selected.value = isFuture(shifted) ? toDateKey() : shifted;
}

let lastWheelStep = Number.NEGATIVE_INFINITY;

function stepByWheel(event: WheelEvent) {
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  const settled = event.timeStamp - lastWheelStep >= WHEEL_STEP_DELAY;

  if (delta !== 0 && settled) {
    lastWheelStep = event.timeStamp;
    shiftSelectedDay(Math.sign(delta));
  }
}

useEventListener(() => props.gestureArea, 'wheel', stepByWheel);

useSwipe(() => props.gestureArea, {
  onSwipeEnd(_, direction) {
    if (direction === 'left' || direction === 'right') {
      shiftSelectedDay(direction === 'left' ? 1 : -1);
    }
  },
});

onMounted(() => {
  showSelectedWeek('instant');
});

watch(selected, () => {
  showSelectedWeek('smooth');
}, { flush: 'post' });

function dayStyle(day: DateKey) {
  if (day === selected.value) {
    return 'bg-[rgba(35,136,255,0.16)] font-semibold text-[#67adff]';
  }
  if (isToday(day)) {
    return 'text-[#d7d9dd]';
  }

  return 'text-[#747983]';
}

function fullDate(day: DateKey) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(fromDateKey(day));
}

function weekday(day: DateKey) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(fromDateKey(day));
}
</script>

<template>
  <div
    ref="strip"
    role="group"
    aria-label="Choose a day"
    class="scrollbar-none flex touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-contain"
  >
    <div v-for="week in weeks" :key="week[0]" class="grid w-full shrink-0 snap-center grid-cols-7 gap-1 px-4">
      <button
        v-for="day in week"
        :key="day"
        type="button"
        :disabled="isFuture(day)"
        :aria-label="fullDate(day)"
        :aria-current="day === selected ? 'date' : undefined"
        :class="cn(
          'flex h-[52px] w-11 min-w-0 justify-self-center flex-col items-center justify-center gap-1 rounded-[13px] px-1 py-1.5 transition-all active:scale-95 disabled:opacity-30',
          dayStyle(day),
        )"
        @click="selected = day"
      >
        <span
          class="max-w-full truncate text-[10px] leading-none whitespace-nowrap capitalize"
        >
          {{ isToday(day) ? 'Today' : weekday(day) }}
        </span>

        <span class="flex h-6 items-center justify-center text-sm leading-none font-semibold tabular-nums">
          {{ dayNumber(day) }}
        </span>
      </button>
    </div>
  </div>
</template>
