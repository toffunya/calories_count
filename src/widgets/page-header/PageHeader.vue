<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { ArrowLeftIcon } from '@lucide/vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

withDefaults(defineProps<{ title: string; backTo?: RouteLocationRaw; subtitle?: string; showBack?: boolean }>(), { backTo: '/', showBack: true });
const header = ref<HTMLElement>();
const compact = ref(false);
let scrollRoot: HTMLElement | null = null;
let previous = 0;
function onScroll(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLElement))
    return;
  const current = Math.max(0, target.scrollTop);
  const delta = current - previous;
  if (current <= 4)
    compact.value = false;
  else if (delta > 2)
    compact.value = true;
  else if (delta < -2)
    compact.value = false;
  if (Math.abs(delta) > 2 || current <= 4)
    previous = current;
}
onMounted(() => {
  scrollRoot = header.value?.closest('main') ?? null;
  previous = scrollRoot?.scrollTop ?? 0;
  compact.value = previous > 4;
  scrollRoot?.addEventListener('scroll', onScroll, { capture: true, passive: true });
});
onBeforeUnmount(() => scrollRoot?.removeEventListener('scroll', onScroll, true));
</script>

<template>
  <header ref="header" class="page-header shrink-0" :class="{ compact, 'with-back': showBack }">
    <div class="header-row relative grid grid-cols-[44px_1fr_44px] items-center gap-1">
      <RouterLink v-if="showBack" :to="backTo" aria-label="Назад" class="grid size-11 place-items-center rounded-xl text-[var(--ios-label)] active:bg-white/5"><ArrowLeftIcon class="size-5" /></RouterLink>
      <div v-else class="size-11" aria-hidden="true" />
      <h1 class="page-title min-w-0 text-center font-semibold">{{ title }}</h1>
      <div class="col-start-3 grid size-11 place-items-center"><slot /></div>
    </div>
    <p v-if="subtitle" class="mt-0.5 text-center text-[12px] text-[var(--ios-secondary)]">{{ subtitle }}</p>
  </header>
</template>

<style scoped>
.page-header { position: sticky; top: 0; z-index: 40; isolation: isolate; box-shadow: 0 -2px 0 var(--ios-background); background: var(--ios-background); }
.page-header::before { content: ''; position: absolute; inset: -32px -16px 0; z-index: -1; background: var(--ios-background); }
.page-header .page-title { position: absolute; left: 50%; transform: translateX(-50%); max-width: calc(100% - 96px); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 18px; line-height: 1.3; letter-spacing: -.02em; transition: left 280ms ease, transform 280ms ease; }
.page-header.compact .page-title { left: 0; transform: translateX(0); }
.page-header.compact.with-back .page-title { left: 48px; }
@media (prefers-reduced-motion: reduce) { .page-header .page-title { transition: none; } }
</style>
