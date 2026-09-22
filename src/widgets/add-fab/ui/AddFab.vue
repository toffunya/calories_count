<script setup lang="ts">
import type { Component } from 'vue';
import type { AddAction } from '../model';
import { CameraIcon, PlusIcon, ScanBarcodeIcon, SearchIcon } from '@lucide/vue';
import { nextTick, onBeforeUnmount, ref, useTemplateRef } from 'vue';

interface ActionItem {
  id: AddAction;
  label: string;
  icon: Component;
}

const emit = defineEmits<{ select: [action: AddAction] }>();

const actions: ActionItem[] = [
  { id: 'add', label: 'Add food', icon: SearchIcon },
  { id: 'food-scan', label: 'Scan food', icon: CameraIcon },
  { id: 'barcode', label: 'Barcode', icon: ScanBarcodeIcon },
];

const HOLD_DELAY = 360;
const MOVE_SLOP = 10;
const TARGET_RADIUS = 44;

const actionButtons = useTemplateRef<HTMLElement[]>('actionButtons');
const open = ref(false);
const pressing = ref(false);
const activeAction = ref<AddAction>();

let holdTimer: ReturnType<typeof setTimeout> | undefined;
let longPress = false;
let origin = { x: 0, y: 0 };

function clearHoldTimer() {
  clearTimeout(holdTimer);
  holdTimer = undefined;
}

function showMenu() {
  clearHoldTimer();
  longPress = true;
  open.value = true;
  void nextTick(() => updateActive(origin.x, origin.y));
}

function hideMenu() {
  open.value = false;
  activeAction.value = undefined;
}

function choose(action: AddAction) {
  clearHoldTimer();
  hideMenu();
  emit('select', action);
}

function updateActive(clientX: number, clientY: number) {
  let closest: { id: AddAction; distance: number } | undefined;

  for (const button of actionButtons.value ?? []) {
    const id = button.dataset.addAction as AddAction;
    const bounds = button.getBoundingClientRect();
    const distance = Math.hypot(clientX - (bounds.left + bounds.width / 2), clientY - (bounds.top + bounds.height / 2));

    if (!closest || distance < closest.distance) {
      closest = { id, distance };
    }
  }

  activeAction.value = closest && closest.distance <= TARGET_RADIUS ? closest.id : undefined;
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return;
  }

  clearHoldTimer();
  longPress = false;
  pressing.value = true;
  activeAction.value = undefined;
  origin = { x: event.clientX, y: event.clientY };

  const button = event.currentTarget as HTMLElement;
  button.setPointerCapture?.(event.pointerId);
  holdTimer = setTimeout(showMenu, HOLD_DELAY);
}

function onPointerMove(event: PointerEvent) {
  const distance = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);

  if (!longPress && distance > MOVE_SLOP) {
    clearHoldTimer();
    return;
  }

  if (open.value) {
    updateActive(event.clientX, event.clientY);
  }
}

function onPointerUp() {
  clearHoldTimer();
  pressing.value = false;

  if (longPress) {
    const selected = activeAction.value;
    hideMenu();

    if (selected) {
      emit('select', selected);
    }
  }
}

function onPointerCancel() {
  clearHoldTimer();
  pressing.value = false;
  hideMenu();
}

function openForKeyboard() {
  longPress = true;
  open.value = true;
}

onBeforeUnmount(clearHoldTimer);
</script>

<template>
  <div class="add-fab-layer">
    <button
      v-if="open"
      type="button"
      class="add-fab-scrim"
      aria-label="Close add menu"
      @click="hideMenu"
    />

    <div v-if="open" id="add-fab-menu" class="add-fab-menu" aria-label="Add food actions">
      <button
        v-for="action in actions"
        :key="action.id"
        ref="actionButtons"
        type="button"
        :data-add-action="action.id"
        class="add-fab-action"
        :class="{ 'is-active': activeAction === action.id }"
        @click.stop="choose(action.id)"
      >
        <span class="add-fab-label">{{ action.label }}</span>
        <component :is="action.icon" class="size-6" stroke-width="2.1" />
      </button>
    </div>

    <button
      type="button"
      class="add-fab-trigger"
      :class="{ 'is-pressing': pressing }"
      aria-label="Add food. Hold and slide for more options"
      aria-haspopup="menu"
      :aria-expanded="open"
      aria-controls="add-fab-menu"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @keydown.down.prevent="openForKeyboard"
    >
      <PlusIcon class="size-7" stroke-width="2.2" />
    </button>
  </div>
</template>

<style scoped>
.add-fab-layer { position: absolute; inset: 0; z-index: 30; pointer-events: none; }
.add-fab-scrim { position: absolute; inset: 0; z-index: 1; border: 0; background: rgb(4 5 7 / 64%); backdrop-filter: blur(2px); pointer-events: auto; }
.add-fab-menu { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.add-fab-action { position: absolute; display: flex; width: 58px; height: 58px; align-items: center; justify-content: center; border: 1px solid rgb(255 255 255 / 12%); border-radius: 999px; background: #20242b; color: #f7f8fa; box-shadow: 0 14px 32px rgb(0 0 0 / 40%); pointer-events: auto; transition: scale 140ms ease, background-color 140ms ease, color 140ms ease; }
.add-fab-action[data-add-action='add'] { bottom: 152px; left: calc(50% - 104px); }
.add-fab-action[data-add-action='food-scan'] { bottom: 200px; left: calc(50% - 29px); }
.add-fab-action[data-add-action='barcode'] { bottom: 152px; left: calc(50% + 46px); }
.add-fab-action.is-active, .add-fab-action:focus-visible { background: #2388ff; color: white; outline: 4px solid rgb(35 136 255 / 22%); scale: 1.12; }
.add-fab-label { position: absolute; bottom: calc(100% + 8px); left: 50%; translate: -50% 0; padding: 7px 10px; border: 1px solid rgb(255 255 255 / 10%); border-radius: 10px; background: #20242b; color: #f7f8fa; box-shadow: 0 8px 20px rgb(0 0 0 / 28%); font-size: 11px; font-weight: 700; line-height: 1; white-space: nowrap; }
.add-fab-trigger { position: absolute; bottom: max(23px, env(safe-area-inset-bottom)); left: 50%; z-index: 3; display: flex; width: 56px; height: 56px; translate: -50% 0; touch-action: none; align-items: center; justify-content: center; border: 0; border-radius: 999px; background: #2388ff; color: white; box-shadow: 0 0 24px rgb(35 136 255 / 34%); pointer-events: auto; transition: scale 180ms ease, rotate 160ms ease, box-shadow 240ms ease; }
.add-fab-trigger:active { scale: .95; }
.add-fab-layer:has(.add-fab-menu) .add-fab-trigger { rotate: 45deg; }

@media (prefers-reduced-motion: no-preference) {
  .add-fab-trigger.is-pressing { animation: add-trigger-light 720ms ease-in-out infinite alternate; }
  .add-fab-action { animation: add-action-in 180ms ease both; }
  .add-fab-action[data-add-action='food-scan'] { animation-delay: 25ms; }
  .add-fab-action[data-add-action='barcode'] { animation-delay: 50ms; }
  @keyframes add-trigger-light {
    from { box-shadow: 0 0 16px rgb(35 136 255 / 28%); }
    to { box-shadow: 0 0 38px 8px rgb(35 136 255 / 48%); }
  }
  @keyframes add-action-in { from { opacity: 0; translate: 12px 12px; scale: .82; } }
}
</style>
