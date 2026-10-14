<script setup lang="ts" generic="T extends string">
import type { Component } from 'vue';
import { CheckIcon, ChevronDownIcon, XIcon } from '@lucide/vue';
import { DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, DialogTrigger, RadioGroupItem, RadioGroupRoot } from 'reka-ui';
import { computed, ref } from 'vue';

const props = defineProps<{ id: string; label: string; icon: Component; options: { id: T; name: string; hint: string; icon?: Component }[] }>();
const value = defineModel<T>({ required: true });
const open = ref(false);
const selected = computed(() => props.options.find(option => option.id === value.value));
const portalTarget = typeof document !== 'undefined' && document.getElementById('app-screen') ? '#app-screen' : 'body';
function choose(option: unknown) {
  if (typeof option !== 'string')
    return;
  value.value = option as T;
  open.value = false;
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <div class="option-field"><span :id="`${id}-label`">{{ label }}</span><DialogTrigger :id="id" type="button" class="option-trigger" :aria-labelledby="`${id}-label ${id}-value`"><component :is="icon" :size="19" aria-hidden="true" /><span :id="`${id}-value`">{{ selected?.name }}</span><ChevronDownIcon :size="16" class="chevron" aria-hidden="true" /></DialogTrigger></div>
    <DialogPortal :to="portalTarget"><DialogOverlay class="option-overlay" /><DialogContent class="option-sheet"><div class="sheet-handle" aria-hidden="true" /><header><DialogTitle>{{ label }}</DialogTitle><button type="button" aria-label="Закрыть" @click="open = false"><XIcon :size="20" /></button></header><DialogDescription class="sr-only">Выбери один вариант.</DialogDescription><RadioGroupRoot :model-value="value" class="option-list" :aria-label="label" @update:model-value="choose"><RadioGroupItem v-for="option in options" :key="option.id" :value="option.id" as-child><button type="button" :data-option="option.id" class="option-row" :class="{ selected: value === option.id }" @click="choose(option.id)"><span class="option-icon"><component :is="option.icon || icon" :size="21" aria-hidden="true" /></span><span class="option-copy"><strong>{{ option.name }}</strong><small>{{ option.hint }}</small></span><span class="option-check"><CheckIcon v-if="value === option.id" :size="16" aria-hidden="true" /></span></button></RadioGroupItem></RadioGroupRoot></DialogContent></DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.option-field { display:flex; flex-direction:column; gap:8px; }.option-field > span { padding-left:2px; font-size:13px; font-weight:500; }.option-trigger { display:flex; align-items:center; gap:12px; width:100%; min-height:56px; padding:12px 15px; border:1px solid #ffffff0b; border-radius:16px; background:var(--ios-surface); color:var(--ios-label); text-align:left; font-size:16px; }.option-trigger > svg { color:var(--ios-secondary); flex-shrink:0; }.option-trigger .chevron { margin-left:auto; }.option-overlay { position:absolute; inset:0; z-index:40; background:#0008; backdrop-filter:blur(3px); }.option-sheet { position:absolute; inset:auto 0 0; z-index:41; max-height:85%; overflow-y:auto; background:var(--ios-surface); color:var(--ios-label); border-radius:24px 24px 0 0; padding:9px 16px max(24px,env(safe-area-inset-bottom)); outline:none; box-shadow:0 -12px 48px #0005; }.sheet-handle { width:34px; height:4px; border-radius:4px; background:var(--ios-fill); margin:0 auto 10px; }.option-sheet header { display:flex; align-items:center; justify-content:space-between; padding:0 4px 12px; }.option-sheet header h2 { font-size:18px; font-weight:650; }.option-sheet header button { display:grid; place-items:center; width:44px; height:44px; color:var(--ios-secondary); }.option-list { display:flex; flex-direction:column; gap:8px; }.option-row { display:flex; align-items:center; gap:12px; width:100%; min-height:76px; padding:14px 12px; background:var(--ios-elevated); border:1px solid transparent; border-radius:16px; text-align:left; }.option-row.selected { background:var(--ios-accent-tint); border-color:#ff9f0a66; }.option-icon { display:grid; place-items:center; flex:0 0 38px; height:38px; background:#ffffff06; border-radius:12px; color:var(--ios-secondary); }.selected .option-icon { color:var(--ios-accent); }.option-copy { display:flex; flex-direction:column; gap:4px; flex:1; }.option-copy strong { font-size:14px; font-weight:600; }.option-copy small { font-size:11px; line-height:1.4; color:var(--ios-secondary); }.option-check { display:grid; place-items:center; flex:0 0 22px; height:22px; border:1px solid var(--ios-fill); border-radius:50%; }.selected .option-check { color:var(--primary-foreground); background:var(--ios-accent); border-color:var(--ios-accent); }
</style>
