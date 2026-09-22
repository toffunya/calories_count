<script setup lang="ts">
import { PlusIcon } from '@lucide/vue';
import { useColorMode, useNow, useWindowSize } from '@vueuse/core';
import { ConfirmDialog, Toaster } from 'shonk-ui';
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { BottomNav } from '@/widgets/bottom-nav';

useColorMode();

const route = useRoute();
const now = useNow({ interval: 60_000 });
const { height: windowHeight, width: windowWidth } = useWindowSize();
const showsNav = computed(() => route.path !== '/onboarding');
const isHome = computed(() => route.path === '/');
const showsDeviceFrame = computed(() => windowWidth.value >= 520);
const deviceScale = computed(() => Math.max(0.42, Math.min(
  (windowWidth.value - 48) / 511,
  (windowHeight.value - 48) / 968,
  1,
)));
const deviceScaleBoxStyle = computed(() => showsDeviceFrame.value
  ? {
      width: `${511 * deviceScale.value}px`,
      height: `${968 * deviceScale.value}px`,
    }
  : undefined);
const deviceStyle = computed(() => showsDeviceFrame.value
  ? {
      width: '511px',
      height: '968px',
      transform: `scale(${deviceScale.value})`,
    }
  : undefined);
const previewTime = computed(() => new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: false,
}).format(now.value));
const homeAddLink = computed(() => {
  const date = typeof route.query.date === 'string' ? route.query.date : undefined;

  return date ? { path: '/add', query: { date } } : '/add';
});
</script>

<template>
  <div class="mobile-prototype-stage" :class="{ 'is-framed': showsDeviceFrame }">
    <div
      class="mobile-prototype-scale-box"
      :style="deviceScaleBoxStyle"
    >
      <div class="mobile-prototype-device" :style="deviceStyle">
        <img
          v-if="showsDeviceFrame"
          src="/assets/iphone/Bezel.png"
          alt=""
          aria-hidden="true"
          draggable="false"
          class="mobile-prototype-bezel"
        >

        <div class="mobile-prototype-screen">
          <div v-if="showsDeviceFrame" class="mobile-prototype-status" aria-label="Device status bar">
            <time>{{ previewTime }}</time>
            <img src="/assets/status/ios-status-icons.svg" alt="" aria-hidden="true">
          </div>

          <div
            class="relative mx-auto flex h-full w-full flex-col overflow-hidden"
            :class="[
              showsDeviceFrame ? 'pt-[54px]' : 'pt-[env(safe-area-inset-top)]',
              isHome ? 'max-w-[393px] bg-[#0c0e11]' : 'max-w-md bg-background',
            ]"
          >
            <RouterView />

            <div
              :class="[
                isHome
                  ? 'absolute inset-x-0 bottom-0 z-20 bg-[#0c0e11] pt-2 pb-[max(8px,env(safe-area-inset-bottom))]'
                  : 'shrink-0',
              ]"
            >
              <div id="bottom-dock" />

              <BottomNav v-if="showsNav" :home="isHome" />

              <RouterLink
                v-if="isHome"
                :to="homeAddLink"
                aria-label="Add food"
                class="absolute right-3 bottom-[max(13px,env(safe-area-inset-bottom))] flex size-14 items-center justify-center rounded-full bg-[#2388ff] text-white shadow-[0_12px_28px_rgba(35,136,255,0.38)] transition-transform active:scale-95"
              >
                <PlusIcon class="size-7" stroke-width="2.2" />
              </RouterLink>
            </div>
          </div>

          <ConfirmDialog />
          <Toaster />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-prototype-stage {
  width: 100%;
  height: 100%;
}

.mobile-prototype-stage.is-framed {
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f5f5f5;
}

.mobile-prototype-scale-box,
.mobile-prototype-device,
.mobile-prototype-screen {
  width: 100%;
  height: 100%;
}

.is-framed .mobile-prototype-scale-box {
  position: relative;
}

.is-framed .mobile-prototype-device {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
}

.mobile-prototype-bezel {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}

.is-framed .mobile-prototype-screen {
  position: absolute;
  top: 58px;
  left: 59px;
  z-index: 1;
  width: 393px;
  height: 852px;
  overflow: hidden;
  border-radius: 42px;
  background: #0c0e11;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 8%);
}

.mobile-prototype-status {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 30;
  display: flex;
  height: 54px;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  color: white;
  font-size: 12px;
  font-weight: 650;
  pointer-events: none;
}

.mobile-prototype-status img {
  width: 54px;
  height: auto;
  filter: invert(1);
}
</style>
