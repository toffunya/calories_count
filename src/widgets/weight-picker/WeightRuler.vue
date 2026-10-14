<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{ label: string }>();
const value = defineModel<number>({ required: true });
const ruler = ref<HTMLElement>();
const ticks = Array.from({ length: 2701 }, (_, i) => i);
function align(kg = value.value) {
  if (ruler.value)
    ruler.value.scrollLeft = Math.round((kg - 30) * 10) * 8;
}
function read() {
  if (ruler.value)
    value.value = Math.max(30, Math.min(300, Math.round(ruler.value.scrollLeft / 8) / 10 + 30));
}
function key(event: KeyboardEvent) {
  const offset: Record<string, number> = { ArrowLeft: -0.1, ArrowRight: 0.1, ArrowUp: 0.1, ArrowDown: -0.1, PageUp: 1, PageDown: -1 };
  let selected = value.value;
  if (event.key === 'Home')
    selected = 30;
  else if (event.key === 'End')
    selected = 300;
  else if (event.key in offset)
    selected = Math.max(30, Math.min(300, Math.round((value.value + offset[event.key]) * 10) / 10));
  else return;
  event.preventDefault();
  value.value = selected;
  align(selected);
}
onMounted(() => align());
defineExpose({ flush: read });
</script>

<template>
  <div class="ruler-wrap">
    <div class="ruler-pointer" aria-hidden="true" />
    <div
      ref="ruler"
      class="weight-ruler"
      role="spinbutton"
      tabindex="0"
      :aria-label="props.label"
      :aria-valuenow="value"
      :aria-valuemin="30"
      :aria-valuemax="300"
      :aria-valuetext="`${value.toFixed(1)} кг`"
      @scroll="read"
      @keydown="key"
    >
      <div class="ruler-spacer" aria-hidden="true" /><div v-for="tick in ticks" :key="tick" class="ruler-tick" :class="{ major: tick % 10 === 0, middle: tick % 5 === 0 }" aria-hidden="true"><i /><span v-if="tick % 10 === 0">{{ tick / 10 + 30 }}</span></div><div class="ruler-spacer" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.ruler-wrap { position:relative; margin:20px -20px 0; }.ruler-pointer { position:absolute; left:50%; top:0; width:3px; height:52px; transform:translateX(-50%); border-radius:3px; background:var(--ios-accent); z-index:2; pointer-events:none; }.weight-ruler { display:flex; height:100px; overflow-x:auto; overflow-y:hidden; scrollbar-width:none; overscroll-behavior:contain; scroll-snap-type:x mandatory; touch-action:pan-x; mask-image:linear-gradient(90deg,transparent,#000 20%,#000 80%,transparent); outline:none; }.weight-ruler::-webkit-scrollbar { display:none; }.weight-ruler:focus-visible { box-shadow:inset 0 0 0 2px var(--ios-accent); }.ruler-spacer { flex:0 0 calc(50% - 4px); }.ruler-tick { position:relative; flex:0 0 8px; height:90px; scroll-snap-align:center; }.ruler-tick i { display:block; margin:4px auto 0; width:1px; height:18px; background:var(--ios-fill); }.ruler-tick.middle i { height:28px; background:var(--ios-secondary); }.ruler-tick.major i { height:40px; background:var(--ios-secondary); }.ruler-tick span { position:absolute; top:54px; left:50%; transform:translateX(-50%); font-size:14px; color:var(--ios-secondary); }
</style>
