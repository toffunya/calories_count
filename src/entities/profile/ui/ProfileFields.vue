<script setup lang="ts">
import type { ActivityLevel, Goal, Sex } from '@/shared/db';
import { Button, Input, Label, NativeSelect, NativeSelectOption } from 'shonk-ui';
import { computed } from 'vue';
import { useLocale } from '@/shared/lib';
import { activityOptions, goalOptions, sexOptions } from '../lib/options';

const sex = defineModel<Sex>('sex', { required: true });
const age = defineModel<string>('age', { required: true });
const heightCm = defineModel<string>('heightCm', { required: true });
const weightKg = defineModel<string>('weightKg', { required: true });
const activity = defineModel<ActivityLevel>('activity', { required: true });
const goal = defineModel<Goal>('goal', { required: true });

const { isEnglish } = useLocale();
const copy = computed(() => isEnglish.value
  ? { sex: 'Sex', age: 'Age', height: 'Height, cm', weight: 'Weight, kg', activity: 'Activity', goal: 'Goal' }
  : { sex: 'Пол', age: 'Возраст', height: 'Рост, см', weight: 'Вес, кг', activity: 'Активность', goal: 'Цель' });
const translatedSexOptions = computed(() => isEnglish.value
  ? sexOptions.map(option => ({ ...option, name: option.id === 'male' ? 'Male' : 'Female' }))
  : sexOptions);
const translatedActivityOptions = computed(() => isEnglish.value
  ? activityOptions.map(option => ({
      ...option,
      name: ({ sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', high: 'High', veryHigh: 'Very high' })[option.id],
      hint: ({ sedentary: 'Office work, no training', light: 'Training 1–3 times a week', moderate: 'Training 3–5 times a week', high: 'Training 6–7 times a week', veryHigh: 'Physical work or two workouts a day' })[option.id],
    }))
  : activityOptions);
const translatedGoalOptions = computed(() => isEnglish.value
  ? goalOptions.map(option => ({
      ...option,
      name: ({ cut: 'Weight loss', cutMild: 'Gentle loss', maintain: 'Maintain weight', bulkMild: 'Gentle gain', bulk: 'Gain weight' })[option.id],
      hint: ({ cut: 'About −0.5 kg a week', cutMild: 'About −0.35 kg a week', maintain: 'Match your daily expenditure', bulkMild: 'About +0.2 kg a week', bulk: 'About +0.3 kg a week' })[option.id],
    }))
  : goalOptions);
const activityHint = computed(() => translatedActivityOptions.value.find(option => option.id === activity.value)?.hint);
const goalHint = computed(() => translatedGoalOptions.value.find(option => option.id === goal.value)?.hint);
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <Label>{{ copy.sex }}</Label>
      <div class="grid grid-cols-2 gap-2">
        <Button
          v-for="option in translatedSexOptions"
          :key="option.id"
          type="button"
          :variant="sex === option.id ? 'default' : 'outline'"
          @click="sex = option.id"
        >
          {{ option.name }}
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div class="flex flex-col gap-2">
        <Label for="age">{{ copy.age }}</Label>
        <Input id="age" v-model="age" inputmode="numeric" placeholder="30" />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="height">{{ copy.height }}</Label>
        <Input id="height" v-model="heightCm" inputmode="numeric" placeholder="180" />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="weight">{{ copy.weight }}</Label>
        <Input id="weight" v-model="weightKg" inputmode="numeric" placeholder="85" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="flex min-w-0 flex-col gap-2 [&>[data-slot=native-select-wrapper]]:w-full">
        <Label>{{ copy.activity }}</Label>
        <NativeSelect v-model="activity" class="w-full">
          <NativeSelectOption v-for="option in translatedActivityOptions" :key="option.id" :value="option.id">
            {{ option.name }}
          </NativeSelectOption>
        </NativeSelect>
        <p class="text-xs text-muted-foreground">
          {{ activityHint }}
        </p>
      </div>

      <div class="flex min-w-0 flex-col gap-2 [&>[data-slot=native-select-wrapper]]:w-full">
        <Label>{{ copy.goal }}</Label>
        <NativeSelect v-model="goal" class="w-full">
          <NativeSelectOption v-for="option in translatedGoalOptions" :key="option.id" :value="option.id">
            {{ option.name }}
          </NativeSelectOption>
        </NativeSelect>
        <p class="text-xs text-muted-foreground">
          {{ goalHint }}
        </p>
      </div>
    </div>
  </div>
</template>
