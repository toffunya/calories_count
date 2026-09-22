<script setup lang="ts">
import type { Entry } from '@/shared/db';
import { Trash2Icon } from '@lucide/vue';
import { SwipeAction } from 'shonk-ui';
import { computed } from 'vue';
import { foodById, FoodThumb, formatAmount } from '@/entities/food';
import { formatNumber, formatTime } from '@/shared/lib';
import { entryAmount, entryKcal } from '../lib/entry';

const props = defineProps<{ entry: Entry; photo?: string }>();

const emit = defineEmits<{
  remove: [entry: Entry];
  edit: [entry: Entry];
}>();

const kcal = computed(() => entryKcal(props.entry));
const amount = computed(() => entryAmount(props.entry));
const displayName = computed(() => foodById(props.entry.foodId ?? '')?.name ?? props.entry.name);
</script>

<template>
  <SwipeAction
    as="li"
    :trigger-threshold="0.3"
    right-action-aria-label="Delete"
    class="overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#171a1f] [&>[data-slot=swipe-action-content]]:bg-[#171a1f]"
    @trigger="emit('remove', props.entry)"
  >
    <template #right-action>
      <Trash2Icon />
    </template>

    <div class="flex min-h-[88px] items-center gap-3 p-2" @click="emit('edit', props.entry)">
      <FoodThumb :food-id="entry.foodId" :photo="entry.photo ?? props.photo" :name="displayName" zoomable class="size-[72px] rounded-[13px]" />

      <div class="flex min-w-0 flex-1 self-stretch flex-col justify-between py-1">
        <div class="flex items-start justify-between gap-2">
          <p class="truncate pr-1 text-base font-semibold text-[#f7f8fa]">
            {{ displayName }}
          </p>
          <span class="shrink-0 rounded-lg bg-[#252930] px-2 py-1 text-[10px] tabular-nums text-[#9297a0]">
            {{ formatTime(entry.createdAt) }}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8f949d]">
          <span><strong class="font-bold text-[#ff974d]">{{ formatNumber(kcal) }} kcal</strong></span>
          <span v-if="amount !== undefined" class="flex items-center gap-1.5 before:size-1 before:rounded-full before:bg-[#74df83]">
            {{ formatAmount(amount, entry.unit) }}
          </span>
          <span v-if="entry.qty !== 1" class="flex items-center gap-1.5 before:size-1 before:rounded-full before:bg-[#74df83]">
            ×{{ entry.qty }}
          </span>
        </div>
      </div>
    </div>
  </SwipeAction>
</template>
