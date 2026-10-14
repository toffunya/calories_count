<script setup lang="ts">
import type { CartItem } from '@/entities/entry';
import type { Food } from '@/entities/food';
import { MinusIcon, PlusIcon } from '@lucide/vue';
import { photoUrl } from '@/entities/food';
import { toCartItem } from '../lib/cart';

const props = defineProps<{ food: Food; qty: number }>();
const emit = defineEmits<{ changeQty: [item: CartItem] }>();
function change(qty: number) {
  emit('changeQty', toCartItem(props.food, Math.max(0, qty)));
}
</script>

<template>
  <li class="product-card min-w-0" :class="{ selected: qty > 0 }">
    <button type="button" class="product-photo block w-full" :aria-label="`Добавить ${food.name}, ${food.amount} г, ${food.kcal} ккал`" @click="change(qty + 1)">
      <img :src="photoUrl(food)" :alt="food.name" loading="lazy" class="size-full object-contain">
    </button>
    <div class="product-footer">
      <p class="product-kcal tabular-nums">{{ food.kcal }} <span>ккал / {{ food.amount }} г</span></p>
      <div class="product-controls" :class="{ filled: qty > 0 }">
        <button v-if="qty" type="button" :aria-label="`Убрать порцию: ${food.name}`" @click="change(qty - 1)"><MinusIcon class="size-4" aria-hidden="true" /></button>
        <span v-if="qty" class="tabular-nums" aria-live="polite" :aria-label="`Порций: ${qty}`">{{ qty }}</span>
        <button type="button" :aria-label="`Добавить порцию: ${food.name}`" @click="change(qty + 1)"><PlusIcon class="size-4" aria-hidden="true" /></button>
      </div>
    </div>
  </li>
</template>

<style scoped>
.product-card { padding: 8px; border-radius: 24px; background: var(--ios-surface); color: var(--ios-label, #fff); border: 1px solid rgba(255,255,255,.08); transition: border-color 160ms ease; }
.product-card.selected { border-color: var(--ios-accent); }
.product-photo { height: 142px; padding: 12px; }
.product-photo img { filter: drop-shadow(0 8px 8px rgba(0,0,0,.22)); }
.product-footer { display: flex; flex-direction: column; align-items: center; gap: 8px; padding-top: 4px; }
.product-kcal { font-size: 15px; font-weight: 700; white-space: nowrap; }
.product-kcal span { font-size: 11px; font-weight: 400; color: var(--ios-secondary); }
.product-controls { display: flex; min-height: 44px; align-items: center; justify-content: center; border-radius: 999px; background: var(--ios-elevated, #2c2c2e); }
.product-controls button { display: grid; width: 44px; height: 44px; place-items: center; border-radius: 50%; color: var(--ios-accent); }
.product-controls button:active { background: rgba(10,132,255,.15); }
.product-controls span { min-width: 28px; text-align: center; font-size: 14px; font-weight: 600; }
@media (prefers-reduced-motion: reduce) { .product-card { transition: none; } }
</style>
