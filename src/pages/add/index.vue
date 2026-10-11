<script setup lang="ts">
import type { CartItem } from '@/entities/entry';
import type { Food } from '@/entities/food';
import { PackageIcon, UtensilsIcon } from '@lucide/vue';
import { Button, cn, toast } from 'shonk-ui';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { addEntries } from '@/entities/entry';
import { activeFoods, matchesQuery, photosById, useCustomFoods } from '@/entities/food';
import { formatDayLabel, isToday, requestedDateKey } from '@/shared/lib';
import { BarcodeScanner } from '@/widgets/barcode-scanner';
import PageHeader from '@/widgets/page-header/PageHeader.vue';
import { cartQty, cartSummary, withCartItem } from './lib/cart';
import CartPanel from './ui/CartPanel.vue';
import CatalogSearch from './ui/CatalogSearch.vue';
import FoodSection from './ui/FoodSection.vue';
import ProductCard from './ui/ProductCard.vue';
import RecipeCard from './ui/RecipeCard.vue';
import SearchEmpty from './ui/SearchEmpty.vue';

const route = useRoute();
const router = useRouter();
const query = ref('');
const tab = ref<'recipes' | 'products'>('recipes');
const productGroup = ref('all');
const recipeGroup = ref('all');
const recipeGroups = [
  { id: 'all', name: 'Все' },
  { id: 'high-protein', name: 'Белковые' },
  { id: 'under-400', name: 'До 400 ккал' },
  { id: 'quick', name: 'До 20 минут' },
  { id: 'balanced', name: 'ПП' },
  { id: 'mine', name: 'Мои' },
];
const productGroups = [
  { id: 'all', name: 'Все' },
  { id: 'yogurt', name: 'Молочные продукты' },
  { id: 'fruit', name: 'Фрукты' },
  { id: 'snacks', name: 'Снеки' },
  { id: 'drinks', name: 'Напитки' },
  { id: 'protein', name: 'Протеиновое' },
  { id: 'balanced', name: 'ПП' },
];
const products = computed(() => activeFoods.filter(food => food.product && (productGroup.value === 'all' || food.product.group === productGroup.value || (productGroup.value === 'protein' && (food.basis?.nutrients?.protein ?? 0) >= 10) || (productGroup.value === 'balanced' && ['yogurt', 'fruit'].includes(food.product.group))) && matchesQuery(food, query.value)));
const items = ref<CartItem[]>([]);
const saving = ref(false);
const scanning = ref(route.query.scan === 'barcode');
const dateKey = computed(() => requestedDateKey(route.query.date));
const showsToday = computed(() => isToday(dateKey.value));
const dayQuery = computed(() => (showsToday.value ? {} : { date: dateKey.value }));
const customFoods = useCustomFoods();
const customPhotos = computed(() => photosById(customFoods.value));

const recipes = computed(() => activeFoods.filter((food): food is Food => !!food.recipe && matchesQuery(food, query.value) && (recipeGroup.value === 'all' || food.recipe.collections.includes(recipeGroup.value as NonNullable<Food['recipe']>['collections'][number]))));

const custom = computed(() => customFoods.value.filter(food => matchesQuery(food, query.value)));
const groups = computed(() => tab.value === 'products' ? productGroups : recipeGroups);
function scanFromSearch() {
  if (tab.value === 'products')
    scanning.value = true;
  else void router.push({ path: '/add/custom', query: { ...dayQuery.value, capture: 'food' } });
}
function chooseGroup(id: string) {
  if (tab.value === 'products')
    productGroup.value = id;
  else recipeGroup.value = id;
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

  <main class="scrollbar-none min-h-0 flex-1 overflow-y-auto bg-[var(--ios-background)] text-white">
    <PageHeader title="Каталог" :show-back="false" :back-to="{ path: '/', query: { date: dateKey } }" class="px-4 pt-3 pb-3" />
    <div class="px-4 pb-3">
      <div v-if="!showsToday" class="mb-3 flex items-center gap-2 text-xs text-zinc-400">Еда на {{ formatDayLabel(dateKey) }}</div>

      <CatalogSearch v-model="query" :section="tab" @scan="scanFromSearch" @manual="router.push({ path: '/add/custom', query: dayQuery })" />
    </div>

    <div class="shrink-0 px-4 pb-3">
      <div class="catalog-tabs grid grid-cols-2 gap-4" aria-label="Раздел каталога">
        <button
          v-for="section in ([{ id: 'recipes', name: 'Рецепты' }, { id: 'products', name: 'Продукты' }] as const)"
          :key="section.id"
          type="button"
          :aria-pressed="tab === section.id"
          class="catalog-section flex min-h-11 items-center justify-center gap-2 py-2 text-sm font-semibold transition-colors"
          :class="tab === section.id ? 'is-active text-white' : 'text-[var(--ios-secondary)]'"
          @click="tab = section.id; query = ''"
        >
          <UtensilsIcon v-if="section.id === 'recipes'" class="size-4" aria-hidden="true" /><PackageIcon v-else class="size-4" aria-hidden="true" />
          {{ section.name }}
        </button>
      </div>
    </div>

    <div class="scrollbar-none shrink-0 overflow-x-auto px-4 pb-3">
      <div class="flex w-max gap-2">
        <button v-for="item in groups" :key="item.id" type="button" :class="cn('rounded-full border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors', (tab === 'products' ? productGroup : recipeGroup) === item.id ? 'border-[var(--ios-blue)] bg-[var(--ios-blue)] text-white' : 'border-white/10 bg-[var(--ios-surface)] text-zinc-400')" @click="chooseGroup(item.id)">
          {{ item.name }}
        </button>
      </div>
    </div>

    <div class="px-4 pb-28">
      <template v-if="tab === 'products'">
        <ul v-if="products.length" class="product-grid grid items-start gap-2">
          <ProductCard v-for="food in products" :key="food.id" :food="food" :qty="cartQty(items, food.id)" @change-qty="changeQty" />
        </ul>
        <SearchEmpty v-else :query="query" @reset="query = ''; productGroup = 'all'" />
      </template>
      <template v-else-if="recipeGroup === 'mine'">
        <FoodSection
          v-if="custom.length"
          :foods="custom"
          :photos="customPhotos"
          :items="items"
          mode="large"
          @change-qty="changeQty"
        />
        <div v-else class="py-10 text-center"><p class="text-[var(--ios-secondary)]">Здесь будут твои блюда</p><Button class="mt-4 rounded-full" @click="router.push({ path: '/add/custom', query: dayQuery })">Добавить блюдо</Button></div>
      </template>
      <template v-else>
        <ul v-if="recipes.length" class="grid grid-cols-2 gap-3">
          <RecipeCard
            v-for="(food, index) in recipes"
            :key="food.id"
            :food="food"
            :index="index"
            :featured="index % 3 === 2"
            @open="openRecipe(food)"
          />
        </ul>

        <SearchEmpty v-else :query="query" @reset="query = ''; recipeGroup = 'all'" />
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

<style scoped>
.catalog-section { position: relative; border-bottom: 2px solid transparent; }
.catalog-section.is-active { border-bottom-color: var(--ios-blue); }
.catalog-section.is-active svg { color: var(--ios-blue); }
.product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
</style>
