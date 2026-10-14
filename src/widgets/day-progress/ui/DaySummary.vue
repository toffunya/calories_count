<script setup lang="ts">
import type { NutrientId } from '@/entities/food';
import type { Entry } from '@/shared/db';
import type { DateKey } from '@/shared/lib';
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { totalKcal, totalNutrients } from '@/entities/entry';
import { formatNutrient, nutrientNames } from '@/entities/food';
import DayProgress from './DayProgress.vue';

const props = defineProps<{ entries: Entry[]; target: number; date: DateKey }>();
const scroller = ref<HTMLDivElement>();
const activeSlide = ref(0);
const ids: NutrientId[] = ['protein', 'fat', 'carbs', 'fiber', 'sugars', 'saturatedFat', 'salt'];
const totals = computed(() => totalNutrients(props.entries));
const rows = computed(() => ids.map(id => ({
  id,
  name: nutrientNames[id],
  value: totals.value?.[id],
  partial: props.entries.some(entry => entry.nutrients?.[id] === undefined),
})));

function selectSlide(index: number) {
  const el = scroller.value;
  if (!el)
    return;
  el.scrollTo({ left: index * el.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

function syncSlide() {
  const el = scroller.value;
  if (el?.clientWidth)
    activeSlide.value = Math.round(el.scrollLeft / el.clientWidth);
}
</script>

<template>
  <section aria-label="Калории и нутриенты за день" class="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[var(--ios-surface)]">
    <div ref="scroller" class="scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain" @scroll="syncSlide">
      <div class="w-full shrink-0 snap-start">
        <DayProgress :eaten="totalKcal(entries)" :target="target" embedded />
      </div>
      <div class="w-full shrink-0 snap-start p-[18px]">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-sm font-semibold">Баланс питания</h2>
          <RouterLink :to="{ path: '/nutrition', query: { date } }" class="text-[12px] font-semibold text-[var(--ios-accent)]">Подробнее →</RouterLink>
        </div>
        <dl class="mt-3 grid grid-cols-2 gap-x-5 gap-y-2">
          <div v-for="(row, index) in rows" :key="row.id" class="flex items-baseline justify-between gap-2" :class="index < 3 ? 'col-span-2' : ''">
            <dt class="text-[12px] text-[var(--ios-secondary)]">{{ row.name }}</dt>
            <dd class="shrink-0 text-[13px] font-semibold tabular-nums" :class="index === 0 ? 'text-[var(--ios-accent)]' : index === 1 ? 'text-[var(--ios-orange)]' : index === 2 ? 'text-[var(--ios-green)]' : ''">
              {{ row.value === undefined ? '—' : formatNutrient(row.value) }}<span v-if="row.partial && row.value !== undefined">*</span>
            </dd>
          </div>
        </dl>
        <p class="mt-3 text-[11px] text-[var(--ios-secondary)]">{{ entries.length ? '— нет данных · * неполный итог' : 'Добавьте еду, чтобы увидеть нутриенты' }}</p>
      </div>
    </div>
    <div class="flex justify-center gap-1 border-t border-white/[0.06]" aria-label="Выбрать сводку">
      <button
        v-for="(label, index) in ['Калории', 'БЖУ']"
        :key="label"
        type="button"
        :aria-pressed="activeSlide === index"
        class="flex items-center gap-2 px-4 text-[12px] font-semibold"
        :class="activeSlide === index ? 'text-[var(--ios-accent)]' : 'text-[var(--ios-secondary)]'"
        @click="selectSlide(index)"
      >
        <span aria-hidden="true" class="size-1.5 rounded-full" :class="activeSlide === index ? 'bg-[var(--ios-accent)]' : 'bg-[var(--ios-fill)]'" />{{ label }}
      </button>
    </div>
  </section>
</template>
