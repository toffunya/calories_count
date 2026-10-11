<script setup lang="ts">
defineProps<{ thinking?: boolean }>();
</script>

<template>
  <svg viewBox="0 0 160 150" role="img" :aria-label="thinking ? 'Рыжик думает' : 'Рыжик, рыжий кот'" class="ginger-cat" :class="{ thinking }">
    <ellipse
      cx="80"
      cy="139"
      rx="47"
      ry="7"
      fill="#ff9f0a"
      opacity=".12"
    />
    <path
      class="tail"
      d="M111 119 C150 124 148 84 130 90 C119 93 140 103 117 108"
      fill="none"
      stroke="#ed8c35"
      stroke-width="14"
      stroke-linecap="round"
    />
    <path d="M48 109 Q43 80 80 80 Q115 80 116 118 Q116 138 80 137 Q44 139 48 109" fill="#ef963e" />
    <ellipse cx="80" cy="115" rx="20" ry="21" fill="#ffe5bd" />
    <g class="head">
      <path d="M39 51 L34 16 Q34 9 42 15 L64 34 M98 34 L121 15 Q129 9 127 20 L123 53" fill="#f5a24d" stroke="#f5a24d" stroke-width="8" stroke-linejoin="round" />
      <path d="M41 23 L44 44 L57 36 M119 23 L115 44 L104 36" fill="#f6b5a0" />
      <path d="M34 62 Q31 32 80 31 Q128 32 127 65 Q128 100 80 102 Q32 100 34 62" fill="#ffb75e" />
      <path d="M67 33 L71 46 M80 32 L80 47 M93 33 L89 46" stroke="#d67728" stroke-width="5" stroke-linecap="round" />
      <path d="M35 64 L48 68 M35 76 L47 77 M124 64 L112 68 M124 76 L112 77" stroke="#e58932" stroke-width="4" stroke-linecap="round" />
      <g class="eyes" fill="#493022">
        <ellipse cx="60" cy="65" rx="5" ry="7" />
        <ellipse cx="100" cy="65" rx="5" ry="7" />
        <circle cx="61" cy="63" r="1.8" fill="#fff" />
        <circle cx="101" cy="63" r="1.8" fill="#fff" />
      </g>
      <ellipse cx="68" cy="82" rx="13" ry="10" fill="#ffe8c9" />
      <ellipse cx="91" cy="82" rx="13" ry="10" fill="#ffe8c9" />
      <path d="M75 76 Q80 72 85 76 L80 81 Z" fill="#c5766a" />
      <path d="M80 80 L80 85 M80 85 Q74 90 70 85 M80 85 Q86 90 90 85" fill="none" stroke="#704635" stroke-width="1.8" stroke-linecap="round" />
      <path d="M52 80 L24 75 M52 86 L23 88 M108 80 L136 75 M108 86 L137 88" stroke="#eac391" stroke-width="2" stroke-linecap="round" />
    </g>
    <ellipse cx="62" cy="133" rx="14" ry="7" fill="#ffbf73" />
    <ellipse
      class="paw"
      cx="99"
      cy="133"
      rx="14"
      ry="7"
      fill="#ffbf73"
    />
  </svg>
</template>

<style scoped>
.ginger-cat { overflow: visible; }
.tail { transform-origin: 115px 116px; animation: tail-sway 3s ease-in-out infinite; }
.eyes { transform-origin: 80px 65px; animation: blink 5s infinite; }
.thinking .head { transform-origin: 80px 95px; animation: ponder 1.5s ease-in-out infinite; }
.thinking .paw { transform-origin: 99px 133px; animation: paw-tap .7s ease-in-out infinite; }
.thinking .tail { animation-duration: 1s; }
@keyframes tail-sway { 50% { transform: rotate(-9deg); } }
@keyframes blink { 0%, 43%, 47%, 100% { transform: scaleY(1); } 45% { transform: scaleY(.1); } }
@keyframes ponder { 50% { transform: rotate(-7deg) translateY(-2px); } }
@keyframes paw-tap { 50% { transform: translateY(-5px); } }
@media (prefers-reduced-motion: reduce) { .tail, .eyes, .thinking .head, .thinking .paw { animation: none; } }
</style>
