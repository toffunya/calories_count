<script setup lang="ts">
const mode = defineModel<'month' | 'week'>({ required: true });
</script>

<template>
  <div class="inline-flex shrink-0 gap-0.5 rounded-[10px] bg-[var(--ios-elevated)] p-0.5" role="group" aria-label="Период">
    <button
      v-for="option in ([{ id: 'month', label: 'Месяц' }, { id: 'week', label: 'Неделя' }] as const)"
      :key="option.id"
      type="button"
      :aria-pressed="mode === option.id"
      class="rounded-lg px-2 text-[12px] font-medium transition-colors"
      :class="mode === option.id ? 'bg-[var(--ios-fill)] text-white shadow-sm' : 'text-[var(--ios-secondary)]'"
      @click="mode = option.id"
    >
      {{ option.label }}
    </button>
  </div>
</template>
