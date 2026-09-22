<script setup lang="ts">
import type { Component } from 'vue';
import { ActivityIcon, ChartColumnIcon, HouseIcon, UserRoundIcon, UtensilsIcon } from '@lucide/vue';
import { cn } from 'shonk-ui';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

interface NavItem {
  to: string;
  label: string;
  icon: Component;
}

const props = withDefaults(defineProps<{ home?: boolean }>(), {
  home: false,
});

const items = computed<NavItem[]>(() => props.home
  ? [
      { to: '/', label: 'Today', icon: HouseIcon },
      { to: '/add', label: 'Recipes', icon: UtensilsIcon },
      { to: '/stats', label: 'Insights', icon: ActivityIcon },
      { to: '/settings', label: 'Profile', icon: UserRoundIcon },
    ]
  : [
      { to: '/', label: 'Home', icon: HouseIcon },
      { to: '/add', label: 'Recipes', icon: UtensilsIcon },
      { to: '/stats', label: 'Stats', icon: ChartColumnIcon },
      { to: '/settings', label: 'Profile', icon: UserRoundIcon },
    ]);
</script>

<template>
  <nav
    :class="cn(
      'relative z-10 rounded-[22px] p-2',
      home
        ? 'mr-[80px] ml-2 h-[66px] border border-white/[0.08] bg-[rgba(23,26,31,0.97)] shadow-[0_12px_30px_rgba(0,0,0,0.38)]'
        : 'mx-auto mb-2 h-20 w-[min(calc(100%_-_2rem),332px)] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.14)]',
    )"
  >
    <ul class="grid h-full grid-cols-4">
      <li v-for="item in items" :key="item.to">
        <RouterLink #default="{ href, navigate, isExactActive }" :to="item.to" custom>
          <a
            :href="href"
            :aria-label="item.label"
            :class="cn(
              'flex w-full items-center justify-center transition-all active:scale-95',
              home ? 'h-12 text-[9px]' : 'h-16 text-[12px]',
              isExactActive ? (home ? 'font-bold text-[#63aaff]' : 'text-[#1683f8]') : (home ? 'text-[#747a84]' : 'text-[#77777d]'),
            )"
            @click="navigate"
          >
            <span
              :class="cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl',
                home ? 'h-12 w-12' : 'h-16 w-16',
                isExactActive && !home && 'bg-[#dcecff]',
              )"
            >
              <component
                :is="item.icon"
                :class="home ? 'size-[19px]' : 'size-7'"
              />
              <span v-if="home || isExactActive">{{ item.label }}</span>
            </span>
          </a>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
