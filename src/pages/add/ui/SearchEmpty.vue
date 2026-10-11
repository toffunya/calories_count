<script setup lang="ts">
defineProps<{ query: string }>();
const emit = defineEmits<{ reset: [] }>();
</script>

<template>
  <div class="search-empty" role="status">
    <svg viewBox="0 0 200 150" class="mx-auto h-36 w-48" role="img" aria-label="Лупа над пустой корзинкой">
      <ellipse cx="100" cy="133" rx="63" ry="8" fill="#2c2c2e" />
      <circle cx="101" cy="70" r="58" fill="#111f2f" />
      <path d="M53 79h81l-9 43H64z" fill="#2c2c2e" stroke="#636366" stroke-width="3" stroke-linejoin="round" />
      <path d="M73 81l14-26m26 26L99 55M78 95v13m19-13v13m19-13v13" stroke="#8e8e93" stroke-width="3" stroke-linecap="round" />
      <circle
        cx="135"
        cy="57"
        r="22"
        fill="#16334f"
        stroke="#0a84ff"
        stroke-width="5"
      />
      <path d="M152 74l20 20" stroke="#0a84ff" stroke-width="8" stroke-linecap="round" />
      <path d="M35 46h8m-4-4v8m112-21h8m-4-4v8" stroke="#636366" stroke-width="2" stroke-linecap="round" />
    </svg>
    <h2 class="mt-3 text-lg font-semibold">Ничего не найдено</h2>
    <p class="mt-2 text-sm text-[var(--ios-secondary)]">{{ query ? `По запросу «${query}»` : 'В этой категории пока пусто' }}</p>
    <p class="mt-1 text-sm text-[var(--ios-secondary)]">Попробуй другое название</p>
    <button type="button" class="mt-5 min-h-11 rounded-full bg-[var(--ios-surface)] px-6 text-sm font-medium text-[var(--ios-blue)]" @click="emit('reset')">Сбросить поиск</button>
  </div>
</template>

<style scoped>
.search-empty { padding: 30px 12px; text-align: center; }
.search-empty p { overflow-wrap: anywhere; }
</style>
