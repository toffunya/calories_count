<script setup lang="ts">
import type { Profile } from '@/shared/db';
import { Button, Input, toast } from 'shonk-ui';
import { computed, ref, watch } from 'vue';
import { calcTarget, resetTargetToCalculated, setManualTarget } from '@/entities/profile';
import { formatNumber, useLocale } from '@/shared/lib';

const props = defineProps<{ profile: Profile }>();
const { isEnglish } = useLocale();
const copy = computed(() => isEnglish.value
  ? { current: 'Current target', automatic: 'Calculated from your profile', manual: 'Set manually', result: 'Profile calculation', set: 'Set target', invalid: 'Enter a whole number from 800 to 6,000 kcal.', reset: 'Use calculated target', applied: 'Target updated', restored: 'Calculated target restored', kcal: 'kcal/day' }
  : { current: 'Текущая норма', automatic: 'Рассчитана по профилю', manual: 'Задана вручную', result: 'Расчёт по профилю', set: 'Задать норму', invalid: 'Укажи целое число от 800 до 6 000 ккал.', reset: 'Вернуть расчётную', applied: 'Норма обновлена', restored: 'Вернули расчётную норму', kcal: 'ккал/день' });
const MIN_TARGET = 800;
const MAX_TARGET = 6000;

const manual = ref(String(props.profile.targetKcal));

watch(() => props.profile.targetKcal, (next) => {
  manual.value = String(next);
});

const calculated = computed(() => calcTarget(props.profile).target);

const entered = computed(() => {
  const value = Number(manual.value);

  return Number.isInteger(value) && value >= MIN_TARGET && value <= MAX_TARGET ? value : null;
});

const changed = computed(() => entered.value !== null && entered.value !== props.profile.targetKcal);

async function apply() {
  if (entered.value === null) {
    return;
  }

  await setManualTarget(entered.value);
  toast(copy.value.applied);
}

async function reset() {
  await resetTargetToCalculated();
  toast(copy.value.restored);
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-[11px] font-semibold text-muted-foreground">{{ copy.current }}</p>
    <p class="text-3xl font-semibold tabular-nums text-foreground">
      {{ formatNumber(props.profile.targetKcal) }}
      <span class="text-sm font-normal text-muted-foreground">{{ copy.kcal }}</span>
    </p>

    <p class="text-xs text-muted-foreground">
      {{ props.profile.targetOverridden ? copy.manual : copy.automatic }} ·
      {{ copy.result }}: {{ formatNumber(calculated) }} kcal
    </p>

    <div class="flex items-end gap-2">
      <Input id="target" v-model="manual" inputmode="numeric" :invalid="entered === null" class="flex-1" />
      <Button type="button" :disabled="!changed" @click="apply">
        {{ copy.set }}
      </Button>
    </div>

    <p v-if="entered === null" class="text-xs text-warning">
      {{ copy.invalid }}
    </p>

    <Button
      v-if="props.profile.targetOverridden"
      type="button"
      variant="outline"
      @click="reset"
    >
      {{ copy.reset }}
    </Button>
  </div>
</template>
