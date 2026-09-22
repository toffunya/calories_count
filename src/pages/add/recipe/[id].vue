<script setup lang="ts">
import { ArrowLeftIcon, CheckIcon, ChefHatIcon, Clock3Icon, FlameIcon, UsersIcon } from '@lucide/vue';
import { Button, toast } from 'shonk-ui';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { addEntries } from '@/entities/entry';
import { foodById, photoUrl } from '@/entities/food';
import { isToday, requestedDateKey } from '@/shared/lib';

const route = useRoute();
const router = useRouter();
const saving = ref(false);
const food = computed(() => foodById(String((route.params as { id?: string }).id ?? '')));
const dateKey = computed(() => requestedDateKey(route.query.date));
const dayQuery = computed(() => (isToday(dateKey.value) ? {} : { date: dateKey.value }));

async function addRecipe() {
  if (!food.value || saving.value)
    return;
  saving.value = true;
  try {
    await addEntries(dateKey.value, [{
      foodId: food.value.id,
      name: food.value.name,
      kcalPerPortion: food.value.kcal,
      nutrients: food.value.nutrients,
      qty: 1,
    }]);
    toast('Рецепт добавлен в дневник');
    await router.push({ path: '/', query: dayQuery.value });
  }
  catch (error) {
    console.error('[add-recipe]', error);
    saving.value = false;
    toast('Не удалось добавить рецепт');
  }
}
</script>

<template>
  <main v-if="food?.recipe" class="scrollbar-none min-h-0 flex-1 overflow-y-auto bg-[#0c0e11] pb-32 text-white">
    <div class="relative h-64 overflow-hidden">
      <img :src="photoUrl(food)" :alt="food.name" class="size-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-[#0c0e11] via-black/5 to-black/35" />
      <button type="button" aria-label="Назад" class="absolute top-4 left-4 flex size-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md" @click="router.back()">
        <ArrowLeftIcon class="size-5" />
      </button>
    </div>

    <div class="relative -mt-9 px-4">
      <div class="rounded-[28px] border border-white/8 bg-[#171a20] p-5 shadow-2xl">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[11px] font-semibold tracking-[0.14em] text-[#2f91ff] uppercase">Рецепт дня</p>
            <h1 class="mt-1 text-2xl leading-7 font-bold tracking-tight">{{ food.name }}</h1>
          </div>
          <div class="flex shrink-0 items-center gap-1 rounded-full bg-[#2f91ff]/12 px-2.5 py-1.5 text-xs font-semibold text-[#65adff]">
            <FlameIcon class="size-3.5" />{{ food.kcal }}
          </div>
        </div>
        <p class="mt-3 text-sm leading-5 text-zinc-400">{{ food.recipe.summary }}</p>

        <div class="mt-4 grid grid-cols-3 gap-2">
          <div class="rounded-2xl bg-black/20 p-3"><Clock3Icon class="size-4 text-[#65adff]" /><p class="mt-2 text-sm font-semibold">{{ food.recipe.timeMinutes }} мин</p><p class="text-[10px] text-zinc-500">всего</p></div>
          <div class="rounded-2xl bg-black/20 p-3"><UsersIcon class="size-4 text-[#84dd79]" /><p class="mt-2 text-sm font-semibold">{{ food.recipe.servings }}</p><p class="text-[10px] text-zinc-500">порции</p></div>
          <div class="rounded-2xl bg-black/20 p-3"><ChefHatIcon class="size-4 text-[#ffb45d]" /><p class="mt-2 text-sm font-semibold">{{ food.recipe.difficulty }}</p><p class="text-[10px] text-zinc-500">уровень</p></div>
        </div>
      </div>

      <section class="mt-4 rounded-[24px] border border-white/8 bg-[#171a20] p-4">
        <h2 class="font-semibold">Пищевая ценность</h2><p class="mt-0.5 text-xs text-zinc-500">на одну порцию</p>
        <div class="mt-4 grid grid-cols-4 gap-2 text-center">
          <div><p class="text-lg font-bold">{{ food.kcal }}</p><p class="text-[10px] text-zinc-500">ккал</p></div>
          <div><p class="text-lg font-bold text-[#75b9ff]">{{ food.nutrients?.protein }}</p><p class="text-[10px] text-zinc-500">белки</p></div>
          <div><p class="text-lg font-bold text-[#ffb45d]">{{ food.nutrients?.fat }}</p><p class="text-[10px] text-zinc-500">жиры</p></div>
          <div><p class="text-lg font-bold text-[#84dd79]">{{ food.nutrients?.carbs }}</p><p class="text-[10px] text-zinc-500">углев.</p></div>
        </div>
      </section>

      <section class="mt-4">
        <h2 class="text-lg font-bold">Ингредиенты</h2>
        <ul class="mt-3 grid gap-2">
          <li v-for="ingredient in food.recipe.ingredients" :key="ingredient" class="flex items-center gap-3 rounded-2xl bg-[#171a20] px-3.5 py-3 text-sm text-zinc-300">
            <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2f91ff]/12 text-[#65adff]"><CheckIcon class="size-3.5" /></span>{{ ingredient }}
          </li>
        </ul>
      </section>

      <section class="mt-5">
        <h2 class="text-lg font-bold">Как готовить</h2>
        <ol class="mt-3 grid gap-3">
          <li v-for="(step, index) in food.recipe.steps" :key="step" class="flex gap-3 rounded-2xl border border-white/8 bg-[#171a20] p-3.5">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2f91ff] text-xs font-bold">{{ index + 1 }}</span><p class="text-sm leading-5 text-zinc-300">{{ step }}</p>
          </li>
        </ol>
      </section>

      <p class="mt-4 text-center text-[11px] text-zinc-600">Источник: <a :href="food.recipe.sourceUrl" target="_blank" rel="noreferrer" class="underline underline-offset-2">{{ food.recipe.sourceName }}</a></p>
    </div>

    <div class="absolute inset-x-4 bottom-[104px] z-10">
      <Button class="h-12 w-full rounded-2xl text-[15px] font-semibold shadow-[0_12px_34px_rgb(47_145_255/28%)]" :disabled="saving" @click="addRecipe">
        {{ saving ? 'Добавляю…' : `Добавить · ${food.kcal} ккал` }}
      </Button>
    </div>
  </main>

  <main v-else class="flex min-h-0 flex-1 items-center justify-center bg-[#0c0e11] px-6 text-center text-white">
    <div><p class="font-semibold">Рецепт не найден</p><Button variant="outline" class="mt-3" @click="router.push('/add')">Вернуться к поиску</Button></div>
  </main>
</template>
