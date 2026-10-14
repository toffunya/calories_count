<script setup lang="ts">
import type { Entry, Profile, WaterRecord } from '@/shared/db';
import type { DateKey } from '@/shared/lib';
import { ChevronDownIcon, GlassWaterIcon, SparklesIcon, UtensilsIcon } from '@lucide/vue';
import { toast, useConfirm } from 'shonk-ui';
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  entriesFrom,
  entriesOfDay,
  EntryRow,
  removeEntry,
  restoreEntry,
  totalKcal,
  totalsByDate,
} from '@/entities/entry';
import { photosById, useCustomFoods } from '@/entities/food';
import { setWaterGlasses, WATER_GOAL_GLASSES, waterOfDay } from '@/entities/health';
import { loadProfile } from '@/entities/profile';
import { formatNumber, fromDateKey, requestedDateKey, shiftDateKey, toDateKey, useLiveQuery } from '@/shared/lib';
import DaySummary from '@/widgets/day-progress/ui/DaySummary.vue';
import { WeekStrip } from '@/widgets/week-strip';

const route = useRoute();
const router = useRouter();
const confirmation = useConfirm();

const dateKey = computed({
  get: () => requestedDateKey(route.query.date),
  set: (date: DateKey) => {
    void router.replace({ query: { date } });
  },
});

const entries = useLiveQuery<Entry[]>(() => entriesOfDay(dateKey.value), [], [dateKey]);
const historyEntries = useLiveQuery<Entry[]>(() => entriesFrom(shiftDateKey(toDateKey(), -185)), []);
const profile = useLiveQuery<Profile | undefined>(() => loadProfile(), undefined);
const customFoods = useCustomFoods();
const waterRecord = useLiveQuery<WaterRecord | undefined>(() => waterOfDay(dateKey.value), undefined, [dateKey]);
const foodOpen = ref(true);

const customPhotos = computed(() => photosById(customFoods.value));

const eaten = computed(() => totalKcal(entries.value));
const target = computed(() => profile.value?.targetKcal ?? 0);
const dailyTotals = computed(() => totalsByDate(historyEntries.value));
const waterGlasses = computed(() => waterRecord.value?.glasses ?? 0);
const monthLabel = computed(() => {
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(fromDateKey(dateKey.value));

  return month.charAt(0).toUpperCase() + month.slice(1);
});

async function remove(entry: Entry) {
  await removeEntry(entry.id);

  toast('Entry deleted', {
    action: {
      label: 'Undo',
      onClick: () => {
        void restoreEntry(entry);
      },
    },
  });
}

function askToRemove(entry: Entry) {
  confirmation.require({
    message: `“${entry.name}” will be removed from this day.`,
    acceptButtonText: 'Delete',
    accept: () => {
      void remove(entry);
    },
  });
}

function editEntry(entry: Entry) {
  void router.push(`/entry/${entry.id}`);
}

function toggleGlass(index: number) {
  const next = waterGlasses.value === index + 1 ? index : index + 1;
  void setWaterGlasses(dateKey.value, next);
}
</script>

<template>
  <main class="scrollbar-none min-h-0 flex-1 overflow-y-auto bg-[var(--ios-background)] text-[var(--ios-label)]">
    <header class="sticky top-0 z-40 flex shrink-0 items-center justify-between bg-[var(--ios-background)] px-4 pt-3 pb-1">
      <h1 class="home-month text-[18px] leading-none font-bold tracking-[-0.025em]">
        {{ monthLabel }}
      </h1>

      <RouterLink :to="{ path: '/chat', query: { date: dateKey } }" aria-label="Открыть чат помощника" class="grid size-10 place-items-center rounded-xl bg-[var(--ios-accent-tint)] text-[var(--ios-accent)] hover:bg-[var(--ios-accent-tint)] focus-visible:ring-2">
        <SparklesIcon class="size-5" />
      </RouterLink>
    </header>

    <WeekStrip v-model="dateKey" :totals="dailyTotals" :target="target" class="shrink-0 pb-[17px]" />

    <div class="px-4 pb-28">
      <DaySummary :entries="entries" :target="target" :date="dateKey" />

      <section class="mt-3.5 rounded-[16px] border border-white/[0.08] bg-[var(--ios-surface)] p-4">
        <div>
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <GlassWaterIcon class="size-4 text-[var(--ios-accent)]" />
              <span class="text-xs font-semibold">Вода</span>
              <span class="text-[12px] font-semibold text-[var(--ios-accent)]">{{ waterGlasses * 250 }} мл</span>
            </div>
            <span class="text-[12px] text-[var(--ios-secondary)]">{{ waterGlasses }} / {{ WATER_GOAL_GLASSES }} стаканов</span>
          </div>
          <div class="mt-3 grid grid-cols-8 gap-1.5">
            <button
              v-for="index in WATER_GOAL_GLASSES"
              :key="index"
              type="button"
              :aria-label="`${index} стакан`"
              :aria-pressed="index <= waterGlasses"
              class="grid h-9 place-items-center rounded-xl border transition-all active:scale-90"
              :class="index <= waterGlasses ? 'border-[var(--ios-accent)]/40 bg-[var(--ios-accent-tint)] text-[var(--ios-accent)]' : 'border-white/[0.06] bg-white/[0.025] text-[var(--ios-secondary)]'"
              @click="toggleGlass(index - 1)"
            >
              <GlassWaterIcon class="size-[17px]" :fill="index <= waterGlasses ? 'currentColor' : 'none'" />
            </button>
          </div>
        </div>
      </section>

      <section aria-label="Еда" class="mt-3.5 overflow-hidden rounded-[16px] border border-white/[0.08] bg-[var(--ios-surface)]">
        <button type="button" :aria-expanded="foodOpen" aria-controls="food-entries" class="flex w-full items-center gap-3 px-4 py-3 text-left" @click="foodOpen = !foodOpen">
          <span class="grid size-9 place-items-center rounded-xl bg-[var(--ios-orange-tint)] text-[var(--ios-orange)]"><UtensilsIcon class="size-[18px]" /></span>
          <span class="flex-1">
            <span class="block text-sm font-bold">Еда</span>
            <span class="mt-0.5 block text-[12px] text-[var(--ios-secondary)]">{{ entries.length }} записей · {{ formatNumber(eaten) }} ккал</span>
          </span>
          <ChevronDownIcon class="size-4 text-[var(--ios-secondary)] transition-transform" :class="foodOpen ? 'rotate-180' : ''" />
        </button>

        <template v-if="foodOpen">
          <ul v-if="entries.length" id="food-entries" class="divide-y divide-white/[0.08] border-t border-white/[0.08]">
            <EntryRow
              v-for="entry in entries"
              :key="entry.id"
              :entry="entry"
              grouped
              :photo="customPhotos.get(entry.foodId ?? '')"
              @remove="askToRemove"
              @edit="editEntry"
            />
          </ul>

          <div v-else id="food-entries" class="border-t border-white/[0.08] px-6 py-5 text-center">
            <img src="/empty-meals.png" alt="Empty plate" class="mx-auto size-24 object-contain">
            <h2 class="mt-1 text-[16px] leading-tight font-semibold text-[var(--ios-label)]">Пока ничего не добавлено</h2>
            <p class="mt-1 text-xs text-[var(--ios-secondary)]">Нажми +, чтобы добавить еду</p>
          </div>
        </template>
      </section>
    </div>
  </main>
</template>
