<script setup lang="ts">
import type { NutrientId } from '@/entities/food';
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { entriesOfDay, totalKcal, totalNutrients } from '@/entities/entry';
import { formatNutrient, nutrientNames, nutrientTargets } from '@/entities/food';
import { loadProfile } from '@/entities/profile';
import { formatNumber, requestedDateKey, useLiveQuery } from '@/shared/lib';
import PageHeader from '@/widgets/page-header/PageHeader.vue';

const route = useRoute();
const date = computed(() => requestedDateKey(route.query.date));
const entries = useLiveQuery(() => entriesOfDay(date.value), [], [date]);
const profile = useLiveQuery(() => loadProfile(), undefined);
const totals = computed(() => totalNutrients(entries.value));
const targets = computed(() => nutrientTargets(profile.value?.weightKg ?? 70, profile.value?.targetKcal ?? 0));
const ids: NutrientId[] = ['protein', 'fat', 'carbs', 'fiber', 'sugars', 'saturatedFat', 'salt'];
const rows = computed(() => ids.map(id => ({ id, name: nutrientNames[id], value: totals.value?.[id], missing: entries.value.filter(e => e.nutrients?.[id] === undefined).length, target: targets.value.find(t => t.id === id) })));
</script>

<template>
  <main class="scrollbar-none min-h-0 flex-1 overflow-y-auto bg-[var(--ios-background)] px-4 pt-4 pb-28 text-white">
    <PageHeader title="Баланс питания" :back-to="{ path: '/', query: { date } }" :subtitle="date" />
    <label class="mt-4 flex items-center justify-between text-xs text-[var(--ios-secondary)]">Дата<input type="date" :value="date" class="rounded-lg border border-white/10 bg-[var(--ios-surface)] p-2 text-white" @change="$router.replace({ query: { date: ($event.target as HTMLInputElement).value } })"></label>
    <section class="mt-5 rounded-[16px] border border-white/8 bg-[var(--ios-surface)] p-5"><p class="text-xs text-[var(--ios-secondary)]">За выбранный день</p><p class="mt-2 text-3xl font-bold">{{ formatNumber(totalKcal(entries)) }} <span class="text-sm text-[var(--ios-secondary)]">ккал</span></p><p class="mt-2 text-xs text-[var(--ios-secondary)]">{{ entries.length }} записей в дневнике</p></section>
    <p v-if="!entries.length" class="mt-4 text-sm text-[var(--ios-secondary)]">Добавьте еду — здесь появятся белки, жиры, углеводы и другие нутриенты.</p>
    <div class="mt-4 space-y-3"><article v-for="(row, index) in rows" :key="row.id" class="rounded-2xl border border-white/8 bg-[var(--ios-surface)] p-4"><div class="flex justify-between gap-3"><h2 class="text-sm font-semibold">{{ row.name }}</h2><p class="font-bold" :class="index === 0 ? 'text-[var(--ios-accent)]' : index === 1 ? 'text-[var(--ios-orange)]' : 'text-[var(--ios-green)]'">{{ row.value === undefined ? 'Нет данных' : formatNutrient(row.value) }}</p></div><p v-if="row.missing" class="mt-2 text-[12px] text-[var(--ios-secondary)]">Нет данных в {{ row.missing }} из {{ entries.length }} записей. Итог неполный.</p><template v-if="row.target && row.value !== undefined"><div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div class="h-full bg-[var(--ios-accent)]" :style="{ width: `${Math.min(100, row.value / Math.max(1, row.target.amount) * 100)}%` }" /></div><p class="mt-2 text-[12px] text-[var(--ios-secondary)]">{{ row.target.goal === 'limit' ? 'Ориентир: до' : 'Ориентир' }} {{ formatNutrient(row.target.amount) }}</p></template></article></div>
    <RouterLink :to="{ path: '/add', query: { date } }" class="mt-5 block rounded-xl bg-[var(--ios-accent)] p-3 text-center text-sm font-semibold">Добавить еду</RouterLink>
  </main>
</template>
