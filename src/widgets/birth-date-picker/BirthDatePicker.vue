<script setup lang="ts">
import { CalendarDaysIcon } from '@lucide/vue';
import { DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, DialogTrigger } from 'reka-ui';
import { computed, ref, watch } from 'vue';
import DateWheel from './DateWheel.vue';

const props = defineProps<{ min: string; max: string }>();
const value = defineModel<string>({ required: true });
const open = ref(false);
const today = new Date();
const year = ref(today.getFullYear() - 25);
const month = ref(1);
const day = ref(1);
const dayWheel = ref<InstanceType<typeof DateWheel>>();
const monthWheel = ref<InstanceType<typeof DateWheel>>();
const yearWheel = ref<InstanceType<typeof DateWheel>>();
const portalTarget = typeof document !== 'undefined' && document.getElementById('app-screen') ? '#app-screen' : 'body';
const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const monthOptions = months.map((text, i) => ({ value: i + 1, text }));
const minYear = Number(props.min.slice(0, 4));
const maxYear = Number(props.max.slice(0, 4));
const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({ value: minYear + i, text: String(minYear + i) }));
const daysInMonth = computed(() => new Date(year.value, month.value, 0).getDate());
const dayOptions = computed(() => Array.from({ length: daysInMonth.value }, (_, i) => ({ value: i + 1, text: String(i + 1) })));
watch(daysInMonth, (days) => {
  day.value = Math.min(day.value, days);
});
const pendingDate = computed(() => `${year.value}-${String(month.value).padStart(2, '0')}-${String(Math.min(day.value, daysInMonth.value)).padStart(2, '0')}`);
const valid = computed(() => pendingDate.value >= props.min && pendingDate.value <= props.max);
const formatted = computed(() => {
  if (!value.value)
    return 'Выбери дату';
  const [y, m, d] = value.value.split('-');
  return `${d}.${m}.${y}`;
});
watch(open, (isOpen) => {
  if (!isOpen)
    return;
  const initial = value.value || `${today.getFullYear() - 25}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [y, m, d] = initial.split('-').map(Number);
  year.value = y;
  month.value = m;
  day.value = d;
});
function commit() {
  // Flush year and month first because they determine the available days.
  yearWheel.value?.flush();
  monthWheel.value?.flush();
  dayWheel.value?.flush();
  if (!valid.value)
    return;
  value.value = pendingDate.value;
  open.value = false;
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <div class="birthday-field"><span id="birthday-label">Дата рождения</span><DialogTrigger id="birth-date" type="button" class="birthday-trigger" aria-labelledby="birthday-label birthday-value"><CalendarDaysIcon :size="19" aria-hidden="true" /><span id="birthday-value" :class="{ placeholder: !value }">{{ formatted }}</span></DialogTrigger></div>
    <DialogPortal :to="portalTarget">
      <DialogOverlay class="birthday-overlay" />
      <DialogContent class="birthday-sheet">
        <div class="sheet-handle" aria-hidden="true" />
        <header><button type="button" @click="open = false">Отмена</button><DialogTitle>Дата рождения</DialogTitle><button type="button" :disabled="!valid" @click="commit">Готово</button></header>
        <DialogDescription class="sr-only">Прокрути день, месяц и год. С клавиатуры используй стрелки вверх и вниз.</DialogDescription>
        <div class="wheel-headings" aria-hidden="true"><span>День</span><span>Месяц</span><span>Год</span></div>
        <div class="wheels"><div class="selection-band" aria-hidden="true" /><DateWheel ref="dayWheel" v-model="day" label="День" :options="dayOptions" /><DateWheel ref="monthWheel" v-model="month" label="Месяц" :options="monthOptions" /><DateWheel ref="yearWheel" v-model="year" label="Год" :options="yearOptions" /></div>
        <p v-if="!valid" class="date-error" role="status">Выбери дату рождения для возраста от 14 до 100 лет.</p>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.birthday-field { display:flex; flex-direction:column; gap:8px; }.birthday-field > span { font-size:13px; font-weight:500; padding-left:2px; }.birthday-trigger { display:flex; align-items:center; gap:12px; width:100%; min-height:54px; border:1px solid #ffffff0b; border-radius:16px; padding:12px 15px; background:var(--ios-surface); color:var(--ios-label); text-align:left; font-size:16px; }.birthday-trigger svg { color:var(--ios-secondary); }.placeholder { color:#747479; }
.birthday-overlay { position:absolute; inset:0; z-index:40; background:#0008; backdrop-filter:blur(3px); }.birthday-sheet { position:absolute; inset:auto 0 0; z-index:41; border-radius:24px 24px 0 0; padding:9px 16px max(30px,env(safe-area-inset-bottom)); background:var(--ios-surface); color:var(--ios-label); box-shadow:0 -12px 48px #0005; outline:none; }.sheet-handle { width:34px; height:4px; border-radius:3px; background:var(--ios-fill); margin:0 auto 8px; }.birthday-sheet header { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:0 0 8px; border-bottom:1px solid #ffffff0b; }.birthday-sheet header h2 { font-size:14px; font-weight:600; }.birthday-sheet header button { font-size:15px; min-height:44px; color:var(--ios-accent); background:none; }.birthday-sheet header button:last-child { font-weight:600; }.birthday-sheet header button:disabled { opacity:.4; }.wheel-headings { display:grid; grid-template-columns:1fr 1.65fr 1.2fr; margin-top:18px; text-align:center; color:var(--ios-secondary); font-size:11px; }.wheels { display:grid; grid-template-columns:1fr 1.65fr 1.2fr; position:relative; margin-top:8px; mask-image:linear-gradient(transparent,#000 30%,#000 70%,transparent); }.selection-band { position:absolute; left:0; right:0; top:88px; height:44px; background:var(--ios-elevated); border-radius:12px; }.date-error { font-size:12px; text-align:center; color:var(--ios-orange); margin-top:10px; }
</style>
