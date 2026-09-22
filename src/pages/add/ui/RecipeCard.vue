<script setup lang="ts">
import type { Food } from '@/entities/food';
import { ArrowUpRightIcon, Clock3Icon } from '@lucide/vue';
import { photoUrl } from '@/entities/food';

defineProps<{ food: Food }>();
defineEmits<{ open: [] }>();
</script>

<template>
  <li>
    <button type="button" class="group block w-full overflow-hidden rounded-[20px] border border-white/8 bg-[#171a20] text-left shadow-[0_12px_30px_rgb(0_0_0/20%)] transition-transform active:scale-[0.98]" @click="$emit('open')">
      <div class="relative aspect-[1.12] overflow-hidden bg-zinc-900">
        <img :src="photoUrl(food)" :alt="food.name" class="size-full object-cover transition-transform duration-300 group-hover:scale-105">
        <span class="absolute top-2 left-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">{{ food.kcal }} ккал</span>
        <span class="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-black"><ArrowUpRightIcon class="size-3.5" /></span>
      </div>

      <div class="p-3">
        <h2 class="line-clamp-2 min-h-10 text-[14px] leading-5 font-semibold text-white">{{ food.name }}</h2>
        <div class="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
          <Clock3Icon class="size-3" />
          <span>{{ food.recipe?.timeMinutes }} мин</span><span class="text-zinc-700">•</span><span>{{ food.recipe?.difficulty }}</span>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-black/20 p-2 text-center">
          <div><p class="text-[9px] text-zinc-500">Белки</p><p class="mt-0.5 text-[11px] font-semibold text-[#75b9ff]">{{ food.nutrients?.protein }} г</p></div>
          <div class="border-x border-white/6"><p class="text-[9px] text-zinc-500">Жиры</p><p class="mt-0.5 text-[11px] font-semibold text-[#ffb45d]">{{ food.nutrients?.fat }} г</p></div>
          <div><p class="text-[9px] text-zinc-500">Углев.</p><p class="mt-0.5 text-[11px] font-semibold text-[#84dd79]">{{ food.nutrients?.carbs }} г</p></div>
        </div>
      </div>
    </button>
  </li>
</template>
