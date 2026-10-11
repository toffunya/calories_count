<script setup lang="ts">
import type { Component } from 'vue';
import { ActivityIcon, HouseIcon, LayoutGridIcon, UserRoundIcon } from '@lucide/vue';
import { cn } from 'shonk-ui';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useLocale } from '@/shared/lib';

interface NavItem {
  to: string;
  label: string;
  icon: Component;
}

const { isEnglish } = useLocale();
const items = computed<NavItem[]>(() => isEnglish.value
  ? [
      { to: '/', label: 'Today', icon: HouseIcon },
      { to: '/add', label: 'Catalog', icon: LayoutGridIcon },
      { to: '/stats', label: 'Insights', icon: ActivityIcon },
      { to: '/settings', label: 'Profile', icon: UserRoundIcon },
    ]
  : [
      { to: '/', label: 'Сегодня', icon: HouseIcon },
      { to: '/add', label: 'Каталог', icon: LayoutGridIcon },
      { to: '/stats', label: 'Прогресс', icon: ActivityIcon },
      { to: '/settings', label: 'Профиль', icon: UserRoundIcon },
    ]);
</script>

<template>
  <nav
    class="ios-tab-bar relative z-10 mx-2 h-[66px] rounded-[16px] border border-white/[0.08] bg-[rgba(23,26,31,0.97)] p-2 shadow-[0_12px_30px_rgba(0,0,0,0.38)]"
  >
    <ul class="grid h-full grid-cols-[1fr_1fr_64px_1fr_1fr]">
      <template v-for="(item, index) in items" :key="item.to">
        <li v-if="index === 2" aria-hidden="true" />
        <li>
          <RouterLink #default="{ href, navigate, isActive }" :to="item.to" custom>
            <a
              :href="href"
              :aria-label="item.label"
              :class="cn(
                'flex h-12 w-full items-center justify-center text-[12px] transition-all active:scale-95',
                isActive ? 'font-bold text-[var(--ios-blue)]' : 'text-[var(--ios-secondary)]',
              )"
              @click="navigate"
            >
              <span class="flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-xl">
                <component
                  :is="item.icon"
                  class="size-[19px]"
                />
                <span>{{ item.label }}</span>
              </span>
            </a>
          </RouterLink>
        </li>
      </template>
    </ul>
  </nav>
</template>
