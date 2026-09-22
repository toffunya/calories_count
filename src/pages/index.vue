<script setup lang="ts">
import type { Entry, Profile } from '@/shared/db';
import type { DateKey } from '@/shared/lib';
import { CalendarDaysIcon } from '@lucide/vue';
import { toast, useConfirm } from 'shonk-ui';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
import { loadProfile } from '@/entities/profile';
import { fromDateKey, requestedDateKey, shiftDateKey, toDateKey, useLiveQuery } from '@/shared/lib';
import { DayProgress } from '@/widgets/day-progress';
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

const customPhotos = computed(() => photosById(customFoods.value));

const eaten = computed(() => totalKcal(entries.value));
const target = computed(() => profile.value?.targetKcal ?? 0);
const dailyTotals = computed(() => totalsByDate(historyEntries.value));
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
</script>

<template>
  <main class="flex min-h-0 flex-1 flex-col bg-[#0c0e11] text-[#f7f8fa]">
    <header class="flex shrink-0 items-center justify-between px-4 pt-3 pb-1">
      <h1 class="text-[18px] leading-none font-bold tracking-[-0.025em]">
        {{ monthLabel }}
      </h1>

      <label
        class="relative flex size-9 cursor-pointer items-center justify-center rounded-xl text-[#8f949d] transition-colors hover:bg-white/[0.05] hover:text-[#f7f8fa] focus-within:ring-2 focus-within:ring-[#2388ff]"
      >
        <CalendarDaysIcon class="size-5" stroke-width="1.9" aria-hidden="true" />
        <span class="sr-only">Choose date</span>
        <input
          v-model="dateKey"
          type="date"
          aria-label="Choose date"
          class="absolute inset-0 cursor-pointer opacity-0"
        >
      </label>
    </header>

    <WeekStrip v-model="dateKey" :totals="dailyTotals" :target="target" class="shrink-0 pb-[17px]" />

    <div class="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pb-28">
      <DayProgress :eaten="eaten" :target="target" />

      <ul v-if="entries.length" class="mt-3.5 space-y-2.5">
        <EntryRow
          v-for="entry in entries"
          :key="entry.id"
          :entry="entry"
          :photo="customPhotos.get(entry.foodId ?? '')"
          @remove="askToRemove"
          @edit="editEntry"
        />
      </ul>

      <section
        v-else
        class="mt-3.5 rounded-3xl border border-white/[0.08] bg-[#171a1f] px-6 py-5 text-center"
      >
        <div>
          <img
            src="/empty-meals.png"
            alt="Empty plate"
            class="mx-auto size-28 object-contain"
          >
          <h2 class="mt-2 text-[17px] leading-tight font-semibold tracking-[-0.01em] text-[#f7f8fa]">
            You haven’t added anything yet
          </h2>
          <p class="mt-1.5 text-sm leading-5 text-[#8f949d]">
            Tap + to add your first meal
          </p>
        </div>
      </section>
    </div>
  </main>
</template>
