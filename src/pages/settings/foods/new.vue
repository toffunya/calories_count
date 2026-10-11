<script setup lang="ts">
import { Button, toast } from 'shonk-ui';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createCustomFood, CustomFoodFields, draftToCustomFood, emptyCustomDraft } from '@/entities/food';
import PageHeader from '@/widgets/page-header/PageHeader.vue';

const router = useRouter();

const draft = ref(emptyCustomDraft());
const saving = ref(false);

const input = computed(() => draftToCustomFood(draft.value));

async function submit() {
  const food = input.value;

  if (!food || saving.value) {
    return;
  }

  saving.value = true;

  try {
    await createCustomFood(food);
  }
  catch (error) {
    console.error('[submit]', error);
    saving.value = false;
    toast('Не удалось сохранить, попробуй ещё раз');
    return;
  }

  toast(`Блюдо добавлено: ${food.name}`);
  await router.push('/settings/foods');
}
</script>

<template>
  <main class="min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-8">
    <PageHeader title="Новое блюдо" back-to="/settings/foods" />

    <p class="mt-1 text-sm text-muted-foreground">
      Появится в сетке «Добавить». В дневник ничего не запишется.
    </p>

    <form class="mt-6 flex flex-col gap-5" @submit.prevent="submit">
      <CustomFoodFields v-model="draft" />

      <Button type="submit" size="lg" :disabled="!input" :loading="saving">
        Сохранить
      </Button>
    </form>
  </main>
</template>
