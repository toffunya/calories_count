<script setup lang="ts">
import { FootprintsIcon, InfoIcon, PlayIcon, PlusIcon, SquareIcon } from '@lucide/vue';
import { computed, ref } from 'vue';
import { finishWalk, startWalk, walksOfDay } from '@/entities/health';
import { startStepTracking, stepStatus, stopStepTracking, tracking } from '@/entities/health/lib/step-tracker';
import { formatNumber, toDateKey, useLiveQuery } from '@/shared/lib';

const props = defineProps<{ weightKg: number }>();
const records = useLiveQuery(() => walksOfDay(toDateKey()), []);
const steps = computed(() => records.value.reduce((sum, item) => sum + item.steps, 0));
const kcal = computed(() => records.value.reduce((sum, item) => sum + item.burnedKcal, 0));
const manual = ref('');
const saving = ref(false);
const changing = ref(false);
async function toggleTracking() {
  if (changing.value)
    return;
  changing.value = true;
  try {
    if (tracking.value)
      await stopStepTracking();
    else await startStepTracking(props.weightKg);
  }
  finally {
    changing.value = false;
  }
}
async function addManual() {
  const value = Number(manual.value);
  if (!Number.isFinite(value) || value <= 0 || value > 100000 || tracking.value || saving.value || changing.value)
    return;
  saving.value = true;
  try {
    const walk = await startWalk();
    await finishWalk(walk.id, walk.steps + Math.round(value), props.weightKg);
    manual.value = '';
  }
  catch {
    stepStatus.value = 'Не удалось сохранить шаги. Попробуйте снова.';
  }
  finally {
    saving.value = false;
  }
}
</script>

<template>
  <section class="mt-4 rounded-[16px] border border-white/8 bg-[var(--ios-surface)] p-4">
    <div class="flex items-center gap-3"><FootprintsIcon class="size-6 text-[var(--ios-secondary)]" /><div><h2 class="text-sm font-bold">Шаги сегодня</h2><p class="mt-1 text-xs text-[var(--ios-secondary)]">{{ formatNumber(steps) }} шагов · ≈ {{ formatNumber(kcal) }} ккал</p></div></div>
    <p v-if="stepStatus !== 'Телефон считает шаги, пока приложение открыто.'" role="status" class="mt-3 text-xs leading-5 text-[var(--ios-secondary)]">{{ stepStatus }}</p>
    <button type="button" class="mt-3 w-full rounded-[8px] bg-[var(--ios-accent)] px-4 py-3 text-sm font-semibold hover:bg-[var(--ios-accent)] disabled:opacity-40" :disabled="saving || changing" @click="toggleTracking"><component :is="tracking ? SquareIcon : PlayIcon" class="mr-2 inline size-4" aria-hidden="true" />{{ tracking ? 'Завершить' : 'Начать' }}</button>
    <details class="mt-2"><summary class="flex w-fit cursor-pointer items-center gap-1.5 py-1 text-[12px] text-[var(--ios-secondary)]"><InfoIcon class="size-3.5" />Как работает</summary><p class="mt-1 text-[12px] leading-4 text-[var(--ios-secondary)]">Телефон в кармане, приложение открыто. Шаги определяются по движению; калории — приблизительная оценка.</p></details>
    <details class="mt-2 border-t border-white/8 pt-3">
      <summary class="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--ios-secondary)]"><PlusIcon class="size-3.5" />Вручную</summary><form class="mt-3 flex gap-2" @submit.prevent="addManual">
        <input
          v-model="manual"
          type="number"
          min="1"
          max="100000"
          required
          aria-label="Шаги вручную"
          placeholder="Количество"
          class="min-w-0 flex-1 rounded-lg border border-white/10 bg-[var(--ios-background)] p-2 text-sm"
          :disabled="tracking || saving || changing"
        ><button class="rounded-lg bg-[var(--ios-accent-tint)] px-3 text-xs" :disabled="tracking || saving || changing">Добавить</button>
      </form>
    </details>
  </section>
</template>
