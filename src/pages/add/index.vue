<script setup lang="ts">
import type { CartItem } from '@/entities/entry';
import type { Food, Portion } from '@/entities/food';
import { SearchIcon } from '@lucide/vue';
import { Button, cn, Input, toast } from 'shonk-ui';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { addEntries } from '@/entities/entry';
import { activeFoods, matchesQuery, photosById, useCustomFoods } from '@/entities/food';
import { formatDayLabel, isToday, requestedDateKey } from '@/shared/lib';
import { BarcodeScanner } from '@/widgets/barcode-scanner';
import { cartSummary, withCartItem } from './lib/cart';
import CartPanel from './ui/CartPanel.vue';
import FoodSection from './ui/FoodSection.vue';
import RecipeCard from './ui/RecipeCard.vue';

type FilterId = 'all' | 'high-protein' | 'under-400' | 'quick' | 'balanced' | 'mine';

const filters: { id: FilterId; name: string }[] = [
  { id: 'all', name: 'Все' },
  { id: 'high-protein', name: 'Белковые' },
  { id: 'under-400', name: 'До 400 ккал' },
  { id: 'quick', name: 'До 20 минут' },
  { id: 'balanced', name: 'Сбалансированные' },
  { id: 'mine', name: 'Мои блюда' },
];

const route = useRoute();
const router = useRouter();
const query = ref('');
const filter = ref<FilterId>('all');
const items = ref<CartItem[]>([]);
const saving = ref(false);
const scanning = ref(route.query.scan === 'barcode');
const dateKey = computed(() => requestedDateKey(route.query.date));
const showsToday = computed(() => isToday(dateKey.value));
const dayQuery = computed(() => (showsToday.value ? {} : { date: dateKey.value }));
const customFoods = useCustomFoods();
const customPhotos = computed(() => photosById(customFoods.value));

const recipes = computed(() => activeFoods.filter((food): food is Food => {
  if (!food.recipe || filter.value === 'mine' || !matchesQuery(food, query.value))
    return false;
  return filter.value === 'all' || food.recipe.collections.includes(filter.value);
}));

const custom = computed(() => filter.value === 'mine'
  ? customFoods.value.filter(food => matchesQuery(food, query.value))
  : []);

function openCustom() {
  void router.push({ path: '/add/custom', query: dayQuery.value });
}

function closeScanner() {
  scanning.value = false;
  if (route.query.scan === 'barcode')
    void router.replace({ path: '/add', query: dayQuery.value });
}

function openScanned(code: string) {
  scanning.value = false;
  void router.push({ path: '/add/custom', query: { ...dayQuery.value, barcode: code } });
}

function openRecipe(food: Food) {
  void router.push({ path: `/add/recipe/${food.id}`, query: dayQuery.value });
}

function changeQty(item: CartItem) {
  items.value = withCartItem(items.value, item);
}

async function confirm() {
  if (saving.value)
    return;
  saving.value = true;
  try {
    await addEntries(dateKey.value, items.value);
  }
  catch (error) {
    console.error('[confirm]', error);
    saving.value = false;
    toast('Не удалось сохранить, попробуй ещё раз');
    return;
  }
  toast(`Добавлено: ${cartSummary(items.value)}`);
  await router.push({ path: '/', query: dayQuery.value });
}
</script>

<template>
  <BarcodeScanner v-if="scanning" @found="openScanned" @close="closeScanner" />

  <main class="flex min-h-0 flex-1 flex-col bg-[#0c0e11] text-white">
    <header class="shrink-0 px-4 pt-5 pb-3">
      <div v-if="!showsToday" class="mb-3 flex items-center gap-2 text-xs text-zinc-400">Рецепты на {{ formatDayLabel(dateKey) }}</div>

      <label class="relative block">
        <SearchIcon class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          v-model="query"
          type="search"
          enterkeyhint="search"
          placeholder="Поиск рецептов"
          aria-label="Поиск рецептов"
          class="h-11 rounded-2xl border-white/10 bg-[#171a20] pr-4 pl-10 text-[15px] text-white placeholder:text-zinc-500"
        />
      </label>
    </header>

    <div class="scrollbar-none shrink-0 overflow-x-auto px-4 pb-3">
      <div class="flex w-max gap-2">
        <button v-for="item in filters" :key="item.id" type="button" :class="cn('rounded-full border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors', filter === item.id ? 'border-[#2f91ff] bg-[#2f91ff] text-white' : 'border-white/10 bg-[#171a20] text-zinc-400')" @click="filter = item.id">
          {{ item.name }}
        </button>
      </div>
    </div>

    <div class="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 pb-28">
      <template v-if="filter !== 'mine'">
        <div class="mb-3 flex items-end justify-between">
          <div>
            <p class="text-[11px] font-semibold tracking-[0.16em] text-[#2f91ff] uppercase">Подборка</p>
            <h1 class="mt-1 text-xl font-bold tracking-tight">Что приготовить</h1>
          </div>
          <span class="text-xs text-zinc-500">{{ recipes.length }} рецептов</span>
        </div>

        <ul v-if="recipes.length" class="grid grid-cols-2 gap-3">
          <RecipeCard v-for="food in recipes" :key="food.id" :food="food" @open="openRecipe(food)" />
        </ul>

        <div v-else class="rounded-3xl border border-white/8 bg-[#171a20] px-6 py-10 text-center">
          <p class="font-semibold">Ничего не нашлось</p>
          <p class="mt-1 text-sm text-zinc-500">Попробуй другой запрос или подборку</p>
        </div>
      </template>

      <template v-else>
        <div class="mb-3">
          <p class="text-[11px] font-semibold tracking-[0.16em] text-[#2f91ff] uppercase">Личная коллекция</p>
          <h1 class="mt-1 text-xl font-bold tracking-tight">Мои блюда</h1>
        </div>

        <FoodSection
          v-if="custom.length"
          :foods="custom as Portion[]"
          :photos="customPhotos"
          :items="items"
          mode="large"
          @change-qty="changeQty"
        />

        <div v-else class="rounded-3xl border border-white/8 bg-[#171a20] px-6 py-9 text-center">
          <p class="font-semibold">Здесь пока пусто</p>
          <p class="mx-auto mt-1 max-w-56 text-sm leading-5 text-zinc-500">Добавляй свои блюда — они появятся только в твоей коллекции</p>
          <Button class="mt-4 rounded-full" @click="openCustom">Добавить блюдо</Button>
        </div>
      </template>
    </div>

    <Teleport defer to="#bottom-dock">
      <CartPanel
        v-if="items.length"
        :items="items"
        :photos="customPhotos"
        :saving="saving"
        @change-qty="changeQty"
        @confirm="confirm"
      />
    </Teleport>
  </main>
</template>
