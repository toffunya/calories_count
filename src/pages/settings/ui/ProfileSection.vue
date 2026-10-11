<script setup lang="ts">
import type { Profile } from '@/shared/db';
import { Button, Input, Label, toast } from 'shonk-ui';
import { computed, reactive, ref, watch } from 'vue';
import {
  calcTarget,
  draftFromProfile,
  draftsEqual,
  draftToInput,
  ProfileFields,
  saveProfile,
  setTargetWeight,
} from '@/entities/profile';
import { formatNumber, useLocale } from '@/shared/lib';

const props = defineProps<{ profile: Profile }>();
const { isEnglish } = useLocale();
const copy = computed(() => isEnglish.value
  ? { saved: 'Profile saved', calculated: 'Calculated target', manual: 'manual target is active', invalid: 'Age, height or weight is outside a reasonable range.', save: 'Save changes', kcal: 'kcal', targetWeight: 'Goal weight, kg', targetHint: 'For example, 55' }
  : { saved: 'Профиль сохранён', calculated: 'Расчётная норма', manual: 'сейчас действует ручная норма', invalid: 'Возраст, рост или вес выходят за разумные границы.', save: 'Сохранить изменения', kcal: 'ккал', targetWeight: 'Цель по весу, кг', targetHint: 'Например, 55' });

const form = reactive(draftFromProfile(props.profile));
const targetWeight = ref(props.profile.targetWeightKg ? String(props.profile.targetWeightKg) : '');

watch(() => props.profile, (next) => {
  Object.assign(form, draftFromProfile(next));
  targetWeight.value = next.targetWeightKg ? String(next.targetWeightKg) : '';
});

const measurements = computed(() => draftToInput(form));
const breakdown = computed(() => (measurements.value ? calcTarget(measurements.value) : null));
const parsedTargetWeight = computed(() => targetWeight.value === '' ? undefined : Number(targetWeight.value));
const validTargetWeight = computed(() => parsedTargetWeight.value === undefined || (Number.isFinite(parsedTargetWeight.value) && parsedTargetWeight.value >= 20 && parsedTargetWeight.value <= 400));
const edited = computed(() => !draftsEqual(form, draftFromProfile(props.profile))
  || parsedTargetWeight.value !== props.profile.targetWeightKg);

const saving = ref(false);

async function submit() {
  if (!measurements.value) {
    return;
  }

  saving.value = true;

  try {
    await saveProfile(measurements.value);
    await setTargetWeight(parsedTargetWeight.value);
    toast(copy.value.saved);
  }
  finally {
    saving.value = false;
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="submit">
    <ProfileFields
      v-model:sex="form.sex"
      v-model:age="form.age"
      v-model:height-cm="form.heightCm"
      v-model:weight-kg="form.weightKg"
      v-model:activity="form.activity"
      v-model:goal="form.goal"
    />

    <div class="flex flex-col gap-2">
      <Label for="target-weight">{{ copy.targetWeight }}</Label>
      <Input id="target-weight" v-model="targetWeight" inputmode="decimal" placeholder="55" />
      <p class="text-xs text-muted-foreground">{{ copy.targetHint }}</p>
    </div>

    <p v-if="breakdown" class="text-sm text-muted-foreground">
      {{ copy.calculated }}: <span class="tabular-nums text-foreground">{{ formatNumber(breakdown.target) }} {{ copy.kcal }}</span>
      <span v-if="props.profile.targetOverridden"> · {{ copy.manual }}</span>
    </p>

    <p v-else class="text-sm text-warning">
      {{ copy.invalid }}
    </p>

    <Button type="submit" :disabled="!breakdown || !edited || !validTargetWeight" :loading="saving">
      {{ copy.save }}
    </Button>
  </form>
</template>
