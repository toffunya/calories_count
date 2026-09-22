<script setup lang="ts">
import { computed } from 'vue';
import { activeFoods } from '@/entities/food';
import { useLocale } from '@/shared/lib';

const version = __APP_VERSION__;
const catalogSize = activeFoods.length;
const { isEnglish } = useLocale();
const builtAt = computed(() => new Intl.DateTimeFormat(isEnglish.value ? 'en-US' : 'ru-RU', { dateStyle: 'long', timeStyle: 'short' })
  .format(new Date(__BUILD_DATE__)));
const copy = computed(() => isEnglish.value
  ? { version: 'Version', built: 'Built', dishes: 'Catalog dishes', install: 'Install on iPhone', hint: 'Open the site in Safari, tap Share, then choose Add to Home Screen.' }
  : { version: 'Версия', built: 'Собрано', dishes: 'Блюд в каталоге', install: 'Установка на iPhone', hint: 'Открой сайт в Safari, нажми «Поделиться» и выбери «На экран „Домой“».' });
</script>

<template>
  <div class="flex flex-col gap-4">
    <dl class="flex flex-col gap-2 text-sm">
      <div class="flex justify-between gap-4">
        <dt class="text-muted-foreground">
          {{ copy.version }}
        </dt>
        <dd class="tabular-nums text-foreground">
          {{ version }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-muted-foreground">
          {{ copy.built }}
        </dt>
        <dd class="text-right text-foreground">
          {{ builtAt }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-muted-foreground">
          {{ copy.dishes }}
        </dt>
        <dd class="tabular-nums text-foreground">
          {{ catalogSize }}
        </dd>
      </div>
    </dl>

    <div class="rounded-lg border border-border bg-secondary p-4">
      <p class="text-sm font-medium text-foreground">
        {{ copy.install }}
      </p>
      <p class="mt-1 text-xs text-muted-foreground">
        {{ copy.hint }}
      </p>
    </div>
  </div>
</template>
