<script setup lang="ts">
import type { Food } from '@/entities/food';
import { photoUrl } from '@/entities/food';

defineProps<{ food: Food; featured?: boolean; index?: number }>();
defineEmits<{ open: [] }>();
</script>

<template>
  <li :class="featured ? 'col-span-2' : ''">
    <button
      type="button"
      class="recipe-card group relative w-full overflow-hidden rounded-2xl bg-[var(--ios-surface)] text-left active:opacity-80"
      :class="featured ? 'wide' : ''"
      :aria-label="`${food.name}, ${food.kcal} ккал. Открыть рецепт`"
      @click="$emit('open')"
    >
      <img :src="photoUrl(food)" :alt="food.name" :loading="(index ?? 0) < 3 ? 'eager' : 'lazy'" class="size-full object-cover transition-transform duration-300 group-hover:scale-105">
      <div class="recipe-caption absolute inset-x-0 bottom-0 p-3 text-white">
        <h2 class="line-clamp-2 text-[14px] leading-[1.25] font-semibold">{{ food.name }}</h2>
        <p class="mt-1 text-[12px] tabular-nums text-white/80">{{ food.kcal }} ккал</p>
      </div>
    </button>
  </li>
</template>

<style scoped>
.recipe-card { display: block; height: 215px; }
.recipe-card.wide { height: 240px; }
.recipe-caption { background: linear-gradient(transparent, rgb(0 0 0 / 75%)); padding-top: 48px; }
@media (prefers-reduced-motion: reduce) { .recipe-card img { transition: none; } }
</style>
