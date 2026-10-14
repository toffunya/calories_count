<script setup lang="ts">
import { CameraIcon, PlusIcon, ScanBarcodeIcon, SearchIcon, Trash2Icon, XIcon } from '@lucide/vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps<{ section: 'recipes' | 'products' }>();
const emit = defineEmits<{ scan: []; manual: [] }>();
const query = defineModel<string>({ required: true });
const focused = ref(false);
const input = ref<HTMLInputElement>();
const key = 'catalog-search-history-v1';
type History = Record<'recipes' | 'products', string[]>;
function readHistory(): History {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return Object.fromEntries(['recipes', 'products'].map(section => [section, Array.isArray(value[section]) ? value[section].filter((v: unknown) => typeof v === 'string').slice(0, 6) : []])) as History;
  }
  catch {
    return { recipes: [], products: [] };
  }
}
const history = ref<History>(readHistory());
const recent = computed(() => history.value[props.section]);
function persist() {
  try {
    localStorage.setItem(key, JSON.stringify(history.value));
  }
  catch { /* Search remains usable when storage is unavailable. */ }
}
function remember(value = query.value, section = props.section) {
  const term = value.trim();
  if (term.length < 2)
    return;
  history.value[section] = [term, ...history.value[section].filter(v => v.toLocaleLowerCase() !== term.toLocaleLowerCase())].slice(0, 6);
  persist();
}
let timer: ReturnType<typeof setTimeout> | undefined;
watch(query, (value) => {
  clearTimeout(timer);
  const section = props.section;
  if (value.trim().length >= 2)
    timer = setTimeout(remember, 900, value, section);
});
watch(() => props.section, () => clearTimeout(timer));
onBeforeUnmount(() => clearTimeout(timer));
function clearQuery() {
  remember();
  query.value = '';
  input.value?.focus();
}
function clearHistory() {
  clearTimeout(timer);
  history.value[props.section] = [];
  persist();
}
function removeTerm(term: string) {
  clearTimeout(timer);
  history.value[props.section] = recent.value.filter(value => value !== term);
  persist();
}
function dismiss() {
  input.value?.blur();
  focused.value = false;
}
function reuse(term: string) {
  query.value = term;
  remember(term);
  input.value?.focus();
}
function leaveSearch(event: FocusEvent) {
  if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null))
    focused.value = false;
}
</script>

<template>
  <div class="catalog-search" :class="{ active: focused, typing: query.length > 0 }" @focusin="focused = true" @focusout="leaveSearch">
    <Teleport defer to="#app-screen">
      <button
        v-if="focused && !query"
        type="button"
        class="search-backdrop"
        tabindex="-1"
        aria-label="Закрыть историю поиска"
        @pointerdown.prevent
        @click="dismiss"
      />
    </Teleport>
    <div class="search-field">
      <SearchIcon class="search-icon size-4 shrink-0" aria-hidden="true" />
      <input
        ref="input"
        v-model="query"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        placeholder="Банан, суп, каша"
        :aria-label="section === 'recipes' ? 'Поиск рецептов' : 'Поиск продуктов'"
        :aria-expanded="focused && !query && recent.length > 0"
        @focus="focused = true"
        @blur="remember()"
        @keydown.enter="remember(); input?.blur()"
        @keydown.esc="clearQuery"
      >
      <button v-if="query" type="button" aria-label="Очистить поиск" @pointerdown.prevent @click="clearQuery"><XIcon class="size-4" aria-hidden="true" /></button>
    </div>
    <button class="search-action" type="button" :aria-label="section === 'products' ? 'Сканировать штрихкод' : 'Сканировать еду'" @click="dismiss(); emit('scan')"><ScanBarcodeIcon v-if="section === 'products'" class="size-5" aria-hidden="true" /><CameraIcon v-else class="size-5" aria-hidden="true" /></button>
    <button class="search-action" type="button" aria-label="Добавить вручную" @click="dismiss(); emit('manual')"><PlusIcon class="size-5" aria-hidden="true" /></button>
    <div v-if="focused && !query" class="search-history">
      <template v-if="recent.length">
        <div class="history-heading"><span>История</span><button type="button" aria-label="Очистить историю" title="Очистить историю" @pointerdown.prevent @click="clearHistory"><Trash2Icon class="size-4" aria-hidden="true" /></button></div>
        <ul class="history-chips"><li v-for="term in recent" :key="term" class="history-chip"><button type="button" class="history-item" @pointerdown.prevent @click="reuse(term)">{{ term }}</button><button type="button" class="history-remove" :aria-label="`Удалить запрос: ${term}`" @pointerdown.prevent @click="removeTerm(term)"><XIcon class="size-3.5" aria-hidden="true" /></button></li></ul>
      </template>
      <p v-else class="search-hint">{{ section === 'recipes' ? 'Найди рецепт по названию или ингредиенту' : 'Найди продукт по названию' }}</p>
    </div>
  </div>
</template>

<style scoped>
.catalog-search { position: relative; display: flex; align-items: center; gap: 6px; }
.catalog-search.active { z-index: 60; }
.search-backdrop { position: absolute; inset: 0; z-index: 55; background: rgba(0,0,0,.66); cursor: default; }
.search-field { position: relative; z-index: 1; display: flex; align-items: center; flex: 1; min-width: 0; height: 48px; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; background: var(--ios-surface); color: var(--ios-secondary); transition: border-color 160ms, box-shadow 160ms; }
.active .search-field { border-color: var(--ios-accent); box-shadow: 0 0 0 3px rgba(10,132,255,.12); }
.search-action { position: relative; z-index: 1; width: 48px; height: 48px; flex-shrink: 0; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.1); border-radius: 50%; background: var(--ios-surface); color: #fff; }
.search-action:active { background: var(--ios-elevated); }
.search-action:focus-visible { outline: 2px solid var(--ios-accent); outline-offset: 2px; }
.search-icon { margin-left: 14px; }
.active .search-icon { color: var(--ios-accent); }
.search-field input { width: 100%; min-width: 0; height: 46px; padding: 0 10px; background: transparent; border: 0; outline: 0; color: #fff; font-size: 15px; }
.search-field input::-webkit-search-cancel-button { display: none; }
.search-field button { width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; border-radius: 50%; }
.search-history { position: absolute; top: calc(100% + 10px); left: 0; right: 0; z-index: 1; border: 1px solid rgba(255,255,255,.08); box-shadow: 0 16px 40px rgba(0,0,0,.4); padding: 10px 12px; border-radius: 18px; background: var(--ios-surface); max-height: 210px; overflow-y: auto; }
.history-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; color: var(--ios-secondary); }
.history-heading button { display: grid; place-items: center; width: 44px; height: 44px; color: var(--ios-secondary); }
.history-chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0 6px; }
.history-chip { display: flex; max-width: 100%; align-items: center; border-radius: 999px; background: var(--ios-elevated); }
.history-item { min-height: 44px; padding-left: 14px; max-width: calc(100% - 44px); text-align: left; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-remove { display: grid; place-items: center; width: 44px; height: 44px; flex-shrink: 0; color: var(--ios-secondary); }
.search-hint { font-size: 13px; color: var(--ios-secondary); padding: 4px; }
@media (prefers-reduced-motion: reduce) { .search-field { transition: none; } }
</style>
