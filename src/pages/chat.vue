<script setup lang="ts">
import { SendIcon } from '@lucide/vue';
import { computed, nextTick, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { entriesOfDay, totalKcal, totalNutrients } from '@/entities/entry';
import { formatNutrient, nutrientNames } from '@/entities/food';
import { loadProfile } from '@/entities/profile';
import { formatNumber, requestedDateKey, useLiveQuery } from '@/shared/lib';
import GingerCat from '@/widgets/ginger-cat/GingerCat.vue';
import PageHeader from '@/widgets/page-header/PageHeader.vue';

const route = useRoute();
const date = computed(() => requestedDateKey(route.query.date));
const entries = useLiveQuery(() => entriesOfDay(date.value), [], [date]);
const profile = useLiveQuery(() => loadProfile(), undefined);
const input = ref('');
const thinking = ref(false);
let replyTimer: ReturnType<typeof setTimeout> | undefined;
onUnmounted(() => clearTimeout(replyTimer));
const feed = ref<HTMLElement>();
const messages = ref([{ role: 'assistant', text: 'Мяу, я Рыжик! Могу показать калории и БЖУ из твоего дневника или объяснить, как включить шагомер. С чего начнём?' }]);
async function send(question = input.value) {
  const text = question.trim();
  if (!text || thinking.value)
    return;
  input.value = '';
  messages.value.push({ role: 'user', text });
  thinking.value = true;
  await scrollToLatest();
  let answer = '';
  if (/шаг|прогул|ходь/i.test(text)) {
    answer = 'Открой Профиль → Шаги сегодня → Начать подсчёт. Разреши датчик движения и положи телефон в карман. Приложение должно оставаться открытым; после сворачивания нажми «Начать» снова.';
  }
  else if (/бжу|бел|жир|углевод|нутри/i.test(text)) {
    const n = totalNutrients(entries.value);
    answer = n
      ? ['protein', 'fat', 'carbs'].map((key) => {
          const id = key as 'protein' | 'fat' | 'carbs';
          return `${nutrientNames[id]}: ${n[id] === undefined ? 'нет данных' : formatNutrient(n[id]!)}`;
        }).join('\n')
      : 'За этот день пока нет данных БЖУ. Добавь еду с заполненными нутриентами.';
    if (entries.value.some(e => !e.nutrients || e.nutrients.protein === undefined || e.nutrients.fat === undefined || e.nutrients.carbs === undefined))
      answer += '\nУ части записей нет данных: сумма может быть неполной.';
  }
  else if (/калор|ккал|остат|съел|итог|сегодня/i.test(text)) {
    const kcal = totalKcal(entries.value);
    const target = profile.value?.targetKcal;
    answer = `За ${date.value} записано ${formatNumber(kcal)} ккал.${target ? ` Цель: ${formatNumber(target)} ккал. ${kcal <= target ? 'Осталось' : 'Выше цели на'} ${formatNumber(Math.abs(target - kcal))} ккал.` : ' Дневная цель пока не указана.'}`;
  }
  else {
    answer = 'Я локальный помощник с ограниченным набором ответов. Могу показать калории, БЖУ и инструкцию по шагомеру. Свободный диалог с ИИ станет доступен после подключения сервера модели.';
  }
  replyTimer = setTimeout(() => {
    messages.value.push({ role: 'assistant', text: answer });
    thinking.value = false;
    void scrollToLatest();
  }, 1200);
}

async function scrollToLatest() {
  await nextTick();
  feed.value?.scrollTo({ top: feed.value.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}
</script>

<template>
  <main class="flex min-h-0 flex-1 flex-col bg-[var(--ios-background)] px-4 pt-4 pb-28 text-white">
    <PageHeader title="Рыжий Помощник" :back-to="{ path: '/', query: { date } }" subtitle="Локальный режим · ИИ ещё не подключён" />
    <div class="flex shrink-0 items-center justify-center gap-3 pt-3">
      <GingerCat :thinking="thinking" class="size-[88px]" />
      <div class="text-sm"><p class="font-semibold text-[var(--ios-orange)]">{{ thinking ? 'Рыжик думает…' : 'Рыжик на связи' }}</p><p class="mt-1 text-[12px] text-[var(--ios-secondary)]">{{ thinking ? 'Смотрю в твой дневник' : 'Разберём день по лапочкам' }}</p></div>
    </div>
    <div ref="feed" role="log" aria-live="polite" :aria-busy="thinking" class="scrollbar-none mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pb-3"><div v-for="(message, index) in messages" :key="index" class="max-w-[92%] whitespace-pre-wrap rounded-2xl p-3.5 text-sm leading-6" :class="message.role === 'user' ? 'ml-auto bg-[var(--ios-blue-tint)]' : 'bg-[var(--ios-surface)]'">{{ message.text }}</div><div v-if="thinking" role="status" class="flex w-fit items-center gap-2 rounded-2xl bg-[var(--ios-surface)] px-4 py-3 text-xs text-[var(--ios-secondary)]"><span>Рыжик готовит ответ</span><span class="typing-dots flex gap-1" aria-hidden="true"><i /><i /><i /></span></div></div>
    <div aria-label="Быстрые вопросы" class="scrollbar-none flex shrink-0 gap-2 overflow-x-auto py-3">
      <button
        v-for="question in ['Итоги дня', 'Мои БЖУ', 'Как считать шаги?']"
        :key="question"
        type="button"
        :disabled="thinking"
        class="question-chip shrink-0 rounded-full border border-[var(--ios-orange)]/20 bg-[var(--ios-orange-tint)] px-4 py-2 text-xs font-semibold text-[var(--ios-orange)]"
        @click="send(question)"
      >
        {{ question }}
      </button>
    </div>
    <form class="flex shrink-0 gap-2" @submit.prevent="send()"><input v-model="input" maxlength="1000" aria-label="Сообщение помощнику" placeholder="Задай вопрос…" class="min-w-0 flex-1 rounded-xl border border-white/10 bg-[var(--ios-surface)] px-3 py-3 text-sm"><button :disabled="!input.trim() || thinking" aria-label="Отправить" class="grid size-11 place-items-center rounded-xl bg-[var(--ios-blue)] disabled:opacity-40"><SendIcon class="size-5" /></button></form>
  </main>
</template>

<style scoped>
.question-chip { border-radius: 999px; box-shadow: inset 0 1px 0 #ffffff08; }
.typing-dots i { width: 4px; height: 4px; border-radius: 50%; background: var(--ios-orange); animation: typing 1s ease-in-out infinite; }
.typing-dots i:nth-child(2) { animation-delay: .15s; }
.typing-dots i:nth-child(3) { animation-delay: .3s; }
@keyframes typing { 50% { opacity: .3; transform: translateY(-3px); } }
@media (prefers-reduced-motion: reduce) { .typing-dots i { animation: none; } }
</style>
