<script setup lang="ts">
import type { Entry, Profile, WalkRecord, WaterRecord, WeightRecord } from '@/shared/db';
import type { DateKey } from '@/shared/lib';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, FlameIcon, FootprintsIcon, GlassWaterIcon, HistoryIcon, InfoIcon, PencilIcon, PlusIcon, RulerIcon, ScaleIcon, TargetIcon } from '@lucide/vue';
import { toast } from 'shonk-ui';
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { entriesFrom, totalsByDate } from '@/entities/entry';
import { healthyWeightRange, walksFrom, waterFrom, weightHistory } from '@/entities/health';
import { loadProfile, saveProfile, setTargetWeight } from '@/entities/profile';
import { formatNumber, toDateKey, useLiveQuery } from '@/shared/lib';
import PageHeader from '@/widgets/page-header/PageHeader.vue';
import PeriodToggle from '@/widgets/period-toggle/PeriodToggle.vue';

type Metric = 'calories' | 'weight';
type ViewMode = 'month' | 'week';

interface CalendarDay {
  date: DateKey;
  day: number;
  kcal: number;
  weight?: number;
  isFuture: boolean;
}

const today = new Date();
const todayKey = toDateKey(today);
const visibleMonth = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
const selectedDate = ref<DateKey>(todayKey);
const metric = ref<Metric>('weight');
const viewMode = ref<ViewMode>('month');
watch(metric, (value) => {
  if (value === 'weight') {
    visibleMonth.value = new Date(today);
  }
});

function weekStart(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - (result.getDay() + 6) % 7);
  return result;
}

const periodStart = computed(() => viewMode.value === 'month'
  ? new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth(), 1)
  : weekStart(visibleMonth.value));
const periodStartKey = computed(() => toDateKey(periodStart.value));
const periodEnd = computed(() => viewMode.value === 'month'
  ? new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth() + 1, 0)
  : new Date(periodStart.value.getFullYear(), periodStart.value.getMonth(), periodStart.value.getDate() + 6));
const periodEndKey = computed(() => toDateKey(periodEnd.value));
const entries = useLiveQuery<Entry[]>(() => entriesFrom(periodStartKey.value), [], [periodStartKey]);
const profile = useLiveQuery<Profile | undefined>(() => loadProfile(), undefined);
const waterRecords = useLiveQuery<WaterRecord[]>(() => waterFrom(periodStartKey.value), [], [periodStartKey]);
const walkRecords = useLiveQuery<WalkRecord[]>(() => walksFrom(periodStartKey.value), [], [periodStartKey]);
const weightRecords = useLiveQuery<WeightRecord[]>(() => weightHistory(), []);
const totals = computed(() => totalsByDate(entries.value));
const weightsByDate = computed(() => new Map(weightRecords.value.map(record => [record.date, record.kg])));

const monthLabel = computed(() => {
  if (viewMode.value === 'week') {
    const format = (date: Date) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date).replace('.', '');
    return `${format(periodStart.value)} — ${format(periodEnd.value)}`;
  }

  const label = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' })
    .format(visibleMonth.value)
    .replace(' г.', '');
  return label.charAt(0).toUpperCase() + label.slice(1);
});

const isCurrentMonth = computed(() => periodStartKey.value <= todayKey && periodEndKey.value >= todayKey);

const calendarOffset = computed(() => viewMode.value === 'month' ? (periodStart.value.getDay() + 6) % 7 : 0);
const daysInMonth = computed(() => new Date(
  visibleMonth.value.getFullYear(),
  visibleMonth.value.getMonth() + 1,
  0,
).getDate());

const calendarDays = computed<CalendarDay[]>(() => Array.from({ length: viewMode.value === 'month' ? daysInMonth.value : 7 }, (_, index) => {
  const date = viewMode.value === 'month'
    ? new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth(), index + 1)
    : new Date(periodStart.value.getFullYear(), periodStart.value.getMonth(), periodStart.value.getDate() + index);
  const dateKey = toDateKey(date);

  return {
    date: dateKey,
    day: date.getDate(),
    kcal: totals.value.get(dateKey) ?? 0,
    weight: weightsByDate.value.get(dateKey),
    isFuture: dateKey > todayKey,
  };
}));

const trackedDays = computed(() => calendarDays.value.filter(day => day.kcal > 0));
const total = computed(() => trackedDays.value.reduce((sum, day) => sum + day.kcal, 0));
const average = computed(() => trackedDays.value.length ? Math.round(total.value / trackedDays.value.length) : 0);
const periodWaterMl = computed(() => waterRecords.value
  .filter(record => record.date >= periodStartKey.value && record.date <= periodEndKey.value)
  .reduce((sum, record) => sum + record.glasses * record.glassMl, 0));
const periodSteps = computed(() => walkRecords.value
  .filter(record => record.date >= periodStartKey.value && record.date <= periodEndKey.value)
  .reduce((sum, record) => sum + record.steps, 0));
const periodWalkKcal = computed(() => walkRecords.value
  .filter(record => record.date >= periodStartKey.value && record.date <= periodEndKey.value)
  .reduce((sum, record) => sum + record.burnedKcal, 0));
const healthyRange = computed(() => profile.value && profile.value.age >= 20 && profile.value.heightCm > 0 ? healthyWeightRange(profile.value.heightCm) : undefined);
const bmi = computed(() => profile.value?.heightCm ? Math.round(profile.value.weightKg / (profile.value.heightCm / 100) ** 2 * 10) / 10 : undefined);
const distanceToGoal = computed(() => profile.value?.targetWeightKg ? Math.round((profile.value.weightKg - profile.value.targetWeightKg) * 10) / 10 : undefined);
const periodWeights = computed(() => weightRecords.value.filter(item => Number.isFinite(item.kg) && item.date >= periodStartKey.value && item.date <= periodEndKey.value).sort((a, b) => a.date.localeCompare(b.date)));
const monthWeightChange = computed(() => periodWeights.value.length >= 2 ? Math.round((periodWeights.value.at(-1)!.kg - periodWeights.value[0].kg) * 10) / 10 : undefined);
const weightInput = ref('');
const goalInput = ref('');
const saving = ref(false);
const validInput = computed(() => [weightInput.value, goalInput.value].every(value => value === '' || (Number.isFinite(Number(value)) && Number(value) >= 20 && Number(value) <= 400)) && Boolean(weightInput.value || goalInput.value));
async function saveWeight() {
  if (!profile.value || !validInput.value || saving.value)
    return;
  saving.value = true;
  try {
    if (weightInput.value)
      await saveProfile({ ...profile.value, weightKg: Number(weightInput.value) });
    if (goalInput.value)
      await setTargetWeight(Number(goalInput.value));
    weightInput.value = '';
    goalInput.value = '';
    toast('Вес сохранён');
  }
  catch { toast('Не удалось сохранить вес. Попробуйте снова.'); }
  finally { saving.value = false; }
}
function movePeriod(offset: number) {
  visibleMonth.value = viewMode.value === 'month'
    ? new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth() + offset, 1)
    : new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth(), visibleMonth.value.getDate() + offset * 7);

  if (isCurrentMonth.value) {
    selectedDate.value = todayKey;
    return;
  }

  selectedDate.value = toDateKey(visibleMonth.value);
}
</script>

<template>
  <main class="scrollbar-none min-h-0 flex-1 overflow-y-auto bg-[var(--ios-background)] px-4 pt-3 pb-28 text-[var(--ios-label)]">
    <PageHeader title="Статистика" />

    <div class="mt-[18px] grid h-[38px] grid-cols-2 rounded-[11px] bg-[var(--ios-elevated)] p-[3px]" role="tablist" aria-label="Тип статистики">
      <button
        type="button"
        role="tab"
        :aria-selected="metric === 'calories'"
        class="rounded-[9px] text-[13px] font-medium transition-colors"
        :class="metric === 'calories' ? 'bg-[var(--ios-surface)] text-[var(--ios-label)] shadow-sm' : 'text-[var(--ios-secondary)]'"
        @click="metric = 'calories'"
      >
        Калории
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="metric === 'weight'"
        class="rounded-[9px] text-[13px] font-medium transition-colors"
        :class="metric === 'weight' ? 'bg-[var(--ios-surface)] text-[var(--ios-label)] shadow-sm' : 'text-[var(--ios-secondary)]'"
        @click="metric = 'weight'"
      >
        Вес
      </button>
    </div>

    <section v-if="metric === 'weight'" class="mt-5 space-y-3" aria-label="Показатели веса">
      <article class="ios-card p-5">
        <div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="grid size-8 place-items-center rounded-lg bg-[var(--ios-blue-tint)] text-[var(--ios-blue)]"><ScaleIcon class="size-4" aria-hidden="true" /></span><p class="ios-caption">Текущий вес</p></div><RouterLink to="/settings/preferences" aria-label="Редактировать параметры профиля" class="grid size-11 place-items-center rounded-xl text-[var(--ios-blue)]"><PencilIcon class="size-4" /></RouterLink></div>
        <p class="mt-2 text-[40px] leading-none font-bold tracking-tight tabular-nums">{{ profile ? formatNumber(profile.weightKg) : '—' }} <span class="text-lg font-medium text-muted-foreground">кг</span></p>
        <div class="mt-4 flex justify-between border-t border-white/10 pt-3 text-sm"><span class="flex items-center gap-1.5 text-muted-foreground"><RulerIcon class="size-4 text-[var(--ios-blue)]" aria-hidden="true" />Рост {{ profile?.heightCm ?? '—' }} см</span><span>ИМТ {{ bmi ?? '—' }}</span></div>
      </article>
      <article class="ios-card p-4">
        <div class="flex items-center justify-between gap-3"><h2 class="flex items-center gap-2 text-sm font-semibold"><span class="grid size-8 place-items-center rounded-lg bg-[var(--ios-green-tint)] text-[var(--ios-green)]"><RulerIcon class="size-4" aria-hidden="true" /></span>По росту</h2><span class="font-semibold text-[var(--ios-green)]">{{ healthyRange ? `${healthyRange.min}–${healthyRange.max} кг` : '—' }}</span></div>
        <details class="mt-2"><summary aria-label="Как рассчитан ориентир по росту" class="flex w-fit cursor-pointer items-center gap-1.5 text-[12px] text-muted-foreground"><InfoIcon class="size-3.5" />Об ориентире</summary><p class="mt-2 text-xs leading-5 text-muted-foreground">{{ healthyRange ? 'Диапазон по ИМТ 18,5–24,9 для взрослых от 20 лет. Это общий ориентир, не персональный идеальный вес.' : 'Для возраста до 20 лет взрослый диапазон ИМТ не применяется.' }}</p></details>
      </article>
      <article class="ios-card p-4">
        <div class="flex items-center justify-between"><h2 class="flex items-center gap-2 text-sm font-semibold"><span class="grid size-8 place-items-center rounded-lg bg-[var(--ios-orange-tint)] text-[var(--ios-orange)]"><TargetIcon class="size-4" aria-hidden="true" /></span>Цель по весу</h2><span class="font-semibold text-[var(--ios-blue)]">{{ profile?.targetWeightKg ? `${formatNumber(profile.targetWeightKg)} кг` : 'Не задана' }}</span></div>
        <p class="mt-2 text-xs text-muted-foreground">{{ distanceToGoal === undefined ? 'Добавь цель через +' : distanceToGoal > 0 ? `До цели: −${formatNumber(distanceToGoal)} кг` : distanceToGoal < 0 ? `До цели: +${formatNumber(Math.abs(distanceToGoal))} кг` : 'Цель достигнута' }}</p>
      </article>
      <details class="ios-card p-4">
        <summary class="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--ios-blue)]"><PlusIcon class="size-4" />Вес и цель</summary>
        <form class="mt-4 space-y-3" @submit.prevent="saveWeight">
          <label class="block text-sm">Новый вес, кг<input
            v-model="weightInput"
            type="number"
            step="0.1"
            min="20"
            max="400"
            :placeholder="String(profile?.weightKg ?? '')"
            class="mt-2 w-full border bg-secondary px-3"
            :disabled="saving"
          ></label>
          <label class="block text-sm">Цель, кг<input
            v-model="goalInput"
            type="number"
            step="0.1"
            min="20"
            max="400"
            :placeholder="String(profile?.targetWeightKg ?? '')"
            class="mt-2 w-full border bg-secondary px-3"
            :disabled="saving"
          ></label>
          <button type="submit" class="ios-primary w-full" :disabled="!validInput || saving">{{ saving ? 'Сохраняем…' : 'Сохранить' }}</button>
        </form>
      </details>
    </section>

    <section v-if="metric === 'calories'" class="ios-card mt-5 p-4" aria-label="Статистика за месяц">
      <div class="mb-3 flex items-center justify-between gap-2"><h2 class="flex items-center gap-2 text-sm font-semibold"><FlameIcon class="size-4 text-[var(--ios-orange)]" />Калории</h2><PeriodToggle v-model="viewMode" /></div>
      <div class="grid grid-cols-[36px_1fr_36px] items-center">
        <button type="button" aria-label="Предыдущий период" class="flex size-9 items-center justify-center rounded-xl text-[var(--ios-secondary)] transition-colors active:bg-white/[0.06]" @click="movePeriod(-1)">
          <ChevronLeftIcon class="size-5" :stroke-width="1.8" />
        </button>
        <h2 class="text-center text-[17px] font-medium tracking-[-0.015em]">{{ monthLabel }}</h2>
        <button type="button" aria-label="Следующий период" :disabled="isCurrentMonth" class="flex size-9 items-center justify-center rounded-xl text-[var(--ios-secondary)] transition-colors active:bg-white/[0.06] disabled:opacity-25" @click="movePeriod(1)">
          <ChevronRightIcon class="size-5" :stroke-width="1.8" />
        </button>
      </div>

      <div class="mt-[17px] grid grid-cols-7 gap-[4px] text-center text-[12px] text-[var(--ios-secondary)]" aria-hidden="true">
        <span v-for="weekday in ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']" :key="weekday">{{ weekday }}</span>
      </div>

      <div class="mt-[9px] grid grid-cols-7 gap-[4px]" aria-label="Календарь">
        <span v-for="blank in calendarOffset" :key="`blank-${blank}`" class="h-[48px]" aria-hidden="true" />
        <button
          v-for="day in calendarDays"
          :key="day.date"
          type="button"
          :aria-label="`${day.day}, ${day.kcal ? `${formatNumber(day.kcal)} килокалорий` : 'нет записей'}`"
          :aria-pressed="selectedDate === day.date"
          class="flex h-[48px] min-w-0 flex-col items-center justify-center rounded-[9px] border text-center transition-colors"
          :class="[
            day.kcal > 0 ? 'border-[var(--ios-blue-tint)] bg-[var(--ios-blue-tint)]' : 'border-transparent bg-[var(--ios-surface)]',
            selectedDate === day.date ? '!border-[#6f7d98]' : '',
            day.isFuture ? 'opacity-30' : '',
          ]"
          @click="selectedDate = day.date"
        >
          <span class="text-[14px] leading-4" :class="day.kcal > 0 ? 'text-[var(--ios-secondary)]' : 'text-[var(--ios-secondary)]'">{{ day.day }}</span>
          <span v-if="day.kcal > 0" class="mt-0.5 max-w-full truncate px-0.5 text-[12px] leading-3 font-medium tabular-nums text-[var(--ios-blue)]">{{ formatNumber(day.kcal) }}</span>
        </button>
      </div>
    </section>

    <section v-if="metric === 'calories'" class="mt-[30px]" aria-label="Итоги месяца">
      <div class="grid grid-cols-2 gap-5">
        <div>
          <p class="text-[12px] text-[var(--ios-secondary)]">В среднем за день</p>
          <p class="mt-0.5 text-[20px] leading-6 font-normal tracking-[-0.02em] tabular-nums">{{ formatNumber(average) }} ккал</p>
        </div>
        <div>
          <p class="text-[12px] text-[var(--ios-secondary)]">Всего за месяц</p>
          <p class="mt-0.5 text-[20px] leading-6 font-normal tracking-[-0.02em] tabular-nums">{{ formatNumber(total) }} ккал</p>
        </div>
      </div>
      <p class="mt-[20px] text-[13px] text-[var(--ios-secondary)]">
        {{ trackedDays.length }} {{ trackedDays.length === 1 ? 'день' : trackedDays.length > 1 && trackedDays.length < 5 ? 'дня' : 'дней' }} с записями
      </p>
    </section>

    <section v-else class="ios-card mt-5 p-4" aria-label="Статистика веса">
      <div class="mb-3 flex items-center justify-between gap-2"><h2 class="flex items-center gap-1.5 text-sm font-semibold"><HistoryIcon class="size-4 text-[var(--ios-blue)]" aria-hidden="true" />История веса</h2><PeriodToggle v-model="viewMode" /></div>
      <p v-if="monthWeightChange !== undefined" class="mt-2 text-xs leading-5 text-muted-foreground">{{ `За ${viewMode === 'month' ? 'месяц' : 'неделю'}: ${monthWeightChange > 0 ? '+' : ''}${formatNumber(monthWeightChange)} кг` }}</p>
      <ul v-if="periodWeights.length" class="mt-3 divide-y divide-white/10"><li v-for="record in [...periodWeights].reverse()" :key="record.date" class="flex items-center justify-between py-3 text-sm"><span class="flex items-center gap-2 text-muted-foreground"><CalendarDaysIcon class="size-4" aria-hidden="true" />{{ record.date.split('-').reverse().join('.') }}</span><strong>{{ formatNumber(record.kg) }} кг</strong></li></ul>
      <p v-else class="mt-4 text-sm text-muted-foreground">Нет измерений</p>
    </section>

    <section v-if="metric === 'calories'" class="mt-6 grid grid-cols-3 gap-2" aria-label="Показатели здоровья">
      <article class="rounded-2xl bg-[var(--ios-surface)] p-3">
        <GlassWaterIcon class="mb-2 size-5 text-[var(--ios-blue)]" aria-hidden="true" /><p class="text-[12px] text-[var(--ios-secondary)]">Вода</p>
        <p class="mt-1 text-sm font-bold tabular-nums text-[var(--ios-blue)]">{{ formatNumber(periodWaterMl) }}</p>
        <p class="text-[12px] text-[var(--ios-secondary)]">мл</p>
      </article>
      <article class="rounded-2xl bg-[var(--ios-surface)] p-3">
        <FootprintsIcon class="mb-2 size-5 text-[var(--ios-green)]" aria-hidden="true" /><p class="text-[12px] text-[var(--ios-secondary)]">Шаги</p>
        <p class="mt-1 text-sm font-bold tabular-nums text-[var(--ios-green)]">{{ formatNumber(periodSteps) }}</p>
        <p class="text-[12px] text-[var(--ios-secondary)]">за период</p>
      </article>
      <article class="rounded-2xl bg-[var(--ios-surface)] p-3">
        <FlameIcon class="mb-2 size-5 text-[var(--ios-orange)]" aria-hidden="true" /><p class="text-[12px] text-[var(--ios-secondary)]">Сожжено</p>
        <p class="mt-1 text-sm font-bold tabular-nums text-[var(--ios-orange)]">{{ formatNumber(periodWalkKcal) }}</p>
        <p class="text-[12px] text-[var(--ios-secondary)]">ккал</p>
      </article>
    </section>
  </main>
</template>
