<script setup lang="ts">
import { CheckIcon } from '@lucide/vue';
import { computed } from 'vue';
import { formatNumber } from '@/shared/lib';

const props = defineProps<{
  eaten: number;
  target: number;
  compact?: boolean;
}>();

const ratio = computed(() => (props.target > 0 ? props.eaten / props.target : 0));
const progress = computed(() => Math.min(Math.round(ratio.value * 100), 100));
const remaining = computed(() => props.target - props.eaten);
const isOver = computed(() => remaining.value < 0);
const headline = computed(() => isOver.value ? 'Over target' : 'Daily calories');
</script>

<template>
  <section class="rounded-3xl border border-white/[0.08] bg-[#171a1f] p-[18px]">
    <div class="flex items-center justify-between gap-4 text-xs text-[#8f949d]">
      <span>{{ headline }}</span>
      <span
        class="inline-flex items-center gap-1.5 text-[11px] font-bold"
        :class="isOver ? 'text-[#ff6b6b]' : 'text-[#74df83]'"
      >
        <CheckIcon v-if="!isOver" class="size-3.5" stroke-width="2.5" />
        {{ isOver ? 'Over goal' : 'On track' }}
      </span>
    </div>

    <div class="mt-4 flex items-baseline gap-2">
      <strong
        class="text-[46px] leading-[0.9] font-extrabold tracking-[-0.06em] tabular-nums"
        :class="isOver ? 'text-[#ff6b6b]' : 'text-[#f7f8fa]'"
      >
        {{ formatNumber(Math.abs(remaining)) }}
      </strong>
      <span class="text-base font-semibold text-[#c8cbd0]">kcal {{ isOver ? 'over' : 'left' }}</span>
    </div>

    <p class="mt-3 mb-4 text-xs leading-5 text-[#8f949d]">
      {{ isOver ? `You are ${formatNumber(Math.abs(remaining))} kcal over today.` : `You can still eat ${formatNumber(remaining)} kcal today.` }}
    </p>

    <progress
      class="calorie-progress block h-[9px] w-full overflow-hidden rounded-full"
      :class="isOver ? 'is-over' : ''"
      :value="progress"
      max="100"
      :aria-label="`${progress}% of daily target`"
    />

    <dl class="mt-3.5 grid grid-cols-2">
      <div class="min-w-0 pr-3">
        <dt class="text-[10px] text-[#8f949d]">Eaten</dt>
        <dd class="mt-1 text-[13px] font-semibold tabular-nums text-[#e6e8eb]">
          {{ formatNumber(eaten) }} kcal
        </dd>
      </div>

      <div class="min-w-0 border-l border-white/[0.08] pl-3">
        <dt class="text-[10px] text-[#8f949d]">Daily goal</dt>
        <dd class="mt-1 text-[13px] font-semibold tabular-nums text-[#e6e8eb]">
          {{ formatNumber(target) }} kcal
        </dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.calorie-progress {
  appearance: none;
  border: 0;
  background: #2b3038;
}

.calorie-progress::-webkit-progress-bar {
  border-radius: 999px;
  background: #2b3038;
}

.calorie-progress::-webkit-progress-value {
  border-radius: 999px;
  background: #2388ff;
  transition: width 300ms ease;
}

.calorie-progress::-moz-progress-bar {
  border-radius: 999px;
  background: #2388ff;
}

.calorie-progress.is-over::-webkit-progress-value,
.calorie-progress.is-over::-moz-progress-bar {
  background: #ef4444;
}
</style>
