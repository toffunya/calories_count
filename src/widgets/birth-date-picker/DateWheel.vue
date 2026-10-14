<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{ label: string; options: { value: number; text: string }[] }>();
const value = defineModel<number>({ required: true });
const scroller = ref<HTMLElement>();
const rowHeight = 44;
let scrollTimer: ReturnType<typeof setTimeout> | undefined;
function index() {
  return Math.max(0, props.options.findIndex(option => option.value === value.value));
}
function align() {
  if (scroller.value)
    scroller.value.scrollTop = index() * rowHeight;
}
function settle() {
  if (!scroller.value)
    return;
  const i = Math.max(0, Math.min(props.options.length - 1, Math.round(scroller.value.scrollTop / rowHeight)));
  value.value = props.options[i].value;
}
function onScroll() {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(settle, 100);
}
function key(event: KeyboardEvent) {
  const offsets: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: 10, PageUp: -10 };
  let next = index();
  if (event.key === 'Home')
    next = 0;
  else if (event.key === 'End')
    next = props.options.length - 1;
  else if (event.key in offsets)
    next += offsets[event.key];
  else return;
  event.preventDefault();
  value.value = props.options[Math.max(0, Math.min(props.options.length - 1, next))].value;
}
// Resolve any pending touch scroll before the sheet commits its date.
function flush() {
  clearTimeout(scrollTimer);
  settle();
}
defineExpose({ flush });
onMounted(align);
watch([value, () => props.options], async () => {
  await nextTick();
  align();
});
onBeforeUnmount(() => clearTimeout(scrollTimer));
</script>

<template>
  <div
    ref="scroller"
    class="date-wheel"
    role="spinbutton"
    tabindex="0"
    :aria-label="label"
    :aria-valuemin="options[0]?.value"
    :aria-valuemax="options.at(-1)?.value"
    :aria-valuenow="value"
    :aria-valuetext="options.find(option => option.value === value)?.text"
    @scroll="onScroll"
    @keydown="key"
  >
    <div class="wheel-padding" aria-hidden="true" />
    <div
      v-for="option in options"
      :key="option.value"
      class="wheel-row"
      :class="{ chosen: option.value === value }"
      aria-hidden="true"
      @click="value = option.value"
    >
      {{ option.text }}
    </div>
    <div class="wheel-padding" aria-hidden="true" />
  </div>
</template>

<style scoped>
.date-wheel { height:220px; overflow-y:auto; overscroll-behavior:contain; scroll-snap-type:y mandatory; scrollbar-width:none; touch-action:pan-y; position:relative; z-index:1; outline:none; }
.date-wheel::-webkit-scrollbar { display:none; }
.date-wheel:focus-visible { box-shadow:inset 0 0 0 2px var(--ios-accent); border-radius:12px; }
.wheel-padding { height:88px; }
.wheel-row { height:44px; display:flex; align-items:center; justify-content:center; scroll-snap-align:center; font-size:21px; color:var(--ios-secondary); font-weight:400; cursor:pointer; user-select:none; white-space:nowrap; }
.wheel-row.chosen { color:var(--ios-label); font-size:23px; font-weight:600; }
</style>
