<script setup lang="ts">
import { ScaleIcon, TargetIcon } from '@lucide/vue';
import { DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, DialogTrigger } from 'reka-ui';
import { computed, ref, watch } from 'vue';
import WeightRuler from './WeightRuler.vue';

const props = defineProps<{ id: string; label: string; goal?: boolean; initial?: number }>();
const value = defineModel<string>({ required: true });
const open = ref(false);
const pending = ref(65);
const ruler = ref<InstanceType<typeof WeightRuler>>();
const portalTarget = typeof document !== 'undefined' && document.getElementById('app-screen') ? '#app-screen' : 'body';
const formatted = computed(() => value.value ? Number(value.value).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) : 'Выбери');
watch(open, (isOpen) => {
  if (isOpen)
    pending.value = Math.max(30, Math.min(300, Number(value.value || props.initial || 65)));
});
function commit() {
  ruler.value?.flush();
  value.value = String(Math.round(pending.value * 10) / 10);
  open.value = false;
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <div class="weight-field"><span :id="`${id}-label`">{{ label }}</span><DialogTrigger :id="id" type="button" class="weight-trigger" :aria-labelledby="`${id}-label ${id}-value`"><component :is="goal ? TargetIcon : ScaleIcon" :size="19" aria-hidden="true" /><span :id="`${id}-value`" :class="{ placeholder: !value }">{{ formatted }}</span><small v-if="value">кг</small></DialogTrigger></div>
    <DialogPortal :to="portalTarget"><DialogOverlay class="weight-overlay" /><DialogContent class="weight-sheet"><div class="sheet-handle" aria-hidden="true" /><header><button type="button" @click="open = false">Отмена</button><DialogTitle>{{ goal ? 'Желаемый вес' : 'Вес сейчас' }}</DialogTitle><button type="button" @click="commit">Готово</button></header><div class="weight-display">{{ pending.toFixed(1).replace('.', ',') }}<span>кг</span></div><DialogDescription class="weight-hint">Прокрути шкалу до нужного веса</DialogDescription><WeightRuler ref="ruler" v-model="pending" :label="goal ? 'Желаемый вес' : 'Вес сейчас'" /></DialogContent></DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.weight-field { display:flex; flex-direction:column; gap:8px; min-width:0; }.weight-field > span { font-size:12px; font-weight:500; padding-left:2px; }.weight-trigger { display:flex; align-items:center; gap:10px; width:100%; min-height:54px; border:1px solid #ffffff0b; border-radius:16px; padding:12px; background:var(--ios-surface); color:var(--ios-label); font-size:16px; }.weight-trigger svg { color:var(--ios-secondary); flex-shrink:0; }.weight-trigger small { margin-left:auto; font-size:12px; color:var(--ios-secondary); }.placeholder { color:#747479; }.weight-overlay { position:absolute; inset:0; z-index:40; background:#0008; backdrop-filter:blur(3px); }.weight-sheet { position:absolute; inset:auto 0 0; z-index:41; background:var(--ios-surface); color:var(--ios-label); border-radius:24px 24px 0 0; padding:9px 20px max(30px,env(safe-area-inset-bottom)); box-shadow:0 -12px 48px #0005; outline:none; }.sheet-handle { width:34px; height:4px; background:var(--ios-fill); margin:0 auto 8px; border-radius:4px; }.weight-sheet header { display:flex; align-items:center; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid #ffffff0b; }.weight-sheet header h2 { font-size:14px; font-weight:600; }.weight-sheet header button { min-height:44px; font-size:15px; color:var(--ios-accent); }.weight-sheet header button:last-child { font-weight:600; }.weight-display { text-align:center; font-size:48px; line-height:1.2; letter-spacing:-2px; font-weight:700; margin-top:24px; font-variant-numeric:tabular-nums; }.weight-display span { font-size:18px; font-weight:400; color:var(--ios-secondary); margin-left:8px; letter-spacing:0; }.weight-hint { margin-top:8px; text-align:center; font-size:12px; color:var(--ios-secondary); }
</style>
