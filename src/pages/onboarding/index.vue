<script setup lang="ts">
import type { Sex } from '@/shared/db';
import { ArmchairIcon, ArrowLeftIcon, ArrowRightIcon, BikeIcon, DumbbellIcon, FlameIcon, FootprintsIcon, MarsIcon, MinusIcon, RulerIcon, TargetIcon, TrendingDownIcon, TrendingUpIcon, UserRoundIcon, VenusIcon } from '@lucide/vue';
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { activityOptions, calcTarget, draftToInput, emptyDraft, goalOptions, saveProfile, sexOptions } from '@/entities/profile';
import BirthDatePicker from '@/widgets/birth-date-picker/BirthDatePicker.vue';
import OptionPicker from '@/widgets/option-picker/OptionPicker.vue';
import WeightPicker from '@/widgets/weight-picker/WeightPicker.vue';

const router = useRouter();
const form = reactive(emptyDraft());
const step = ref(0);
const transitionDirection = ref(1);
const sexChosen = ref(false);
function chooseSex(sex: Sex) {
  form.sex = sex;
  sexChosen.value = true;
}
const name = ref('');
const targetWeight = ref('');
const birthDate = ref('');

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
const today = new Date();
const latestBirth = dateKey(new Date(today.getFullYear() - 14, today.getMonth(), today.getDate()));
const earliestBirth = dateKey(new Date(today.getFullYear() - 101, today.getMonth(), today.getDate() + 1));
watch(birthDate, (value) => {
  const [year, month, day] = value.split('-').map(Number);
  const birthday = new Date(year, month - 1, day);
  if (!value || birthday.getFullYear() !== year || birthday.getMonth() !== month - 1 || birthday.getDate() !== day) {
    form.age = '';
    return;
  }
  const years = today.getFullYear() - year - (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day) ? 1 : 0);
  form.age = String(years);
});
const saving = ref(false);
const error = ref('');
const heading = ref<HTMLElement>();
const titles = ['Привет, я Рыжик!', 'Выбери пол', 'Давай познакомимся', 'Твоя отправная точка', 'В твоём ритме', 'Ура, всё готово!'];
const descriptions = ['Я твой виртуальный помощник, который улучшит:', 'Это поможет рассчитать твою норму калорий.', 'Расскажи немного о себе — настроим дневник под тебя.', 'Расскажи о себе, чтобы мы могли настроить дневник под тебя.', 'Укажи активность и цель.', 'Твой план готов. Начнём путь к цели вместе!'];
const activityChoices = activityOptions.map((option, i) => ({ ...option, icon: [ArmchairIcon, FootprintsIcon, BikeIcon, DumbbellIcon, FlameIcon][i] }));
const goalChoices = goalOptions.map((option, i) => ({ ...option, icon: [TrendingDownIcon, TrendingDownIcon, MinusIcon, TrendingUpIcon, TrendingUpIcon][i] }));
const measurements = computed(() => draftToInput(form));
const calorieTarget = computed(() => measurements.value ? calcTarget(measurements.value).target : null);
const validAge = computed(() => Number.isInteger(Number(form.age)) && Number(form.age) >= 14 && Number(form.age) <= 100);
const validTarget = computed(() => Number(String(targetWeight.value).replace(',', '.')) >= 30 && Number(String(targetWeight.value).replace(',', '.')) <= 300);
const canContinue = computed(() => step.value === 0 || (step.value === 1 ? sexChosen.value : step.value === 2 ? name.value.trim().length > 0 && validAge.value : !!measurements.value && validTarget.value));
async function go(to: number) {
  transitionDirection.value = to > step.value ? 1 : -1;
  step.value = to;
  error.value = '';
  await nextTick();
  heading.value?.focus();
}
async function submit() {
  if (!canContinue.value || saving.value)
    return;
  if (step.value < 5) {
    await go(step.value + 1);
    return;
  }
  if (!measurements.value)
    return;
  saving.value = true;
  try {
    await saveProfile({ ...measurements.value, name: name.value.trim(), birthDate: birthDate.value, targetWeightKg: Number(String(targetWeight.value).replace(',', '.')) });
    await router.push('/');
  }
  catch { error.value = 'Не получилось сохранить. Попробуй ещё раз.'; }
  finally { saving.value = false; }
}
</script>

<template>
  <main class="onboarding min-h-0 flex-1 overflow-y-auto">
    <div class="onboarding-top">
      <button v-if="step > 0" type="button" aria-label="Назад" :disabled="saving" @click="go(step - 1)"><ArrowLeftIcon :size="20" /></button>
      <span v-else class="back-space" />
      <div class="step-dots" :aria-label="`Шаг ${step + 1} из 6`"><span v-for="n in 6" :key="n" :class="{ active: n - 1 <= step }" /></div>
      <span class="step-count">{{ step + 1 }} / 6</span>
    </div>
    <form class="onboarding-body" @submit.prevent="submit">
      <div :key="step" class="step-content step-transition" :style="{ '--step-direction': transitionDirection }" :class="{ 'welcome-content': step === 0, 'completion-content': step === 5 }">
        <div class="cat-scene" :class="{ welcome: step === 0, measurements: step === 3, introduction: step === 2, final: step >= 4 }">
          <img v-if="step !== 0" src="/images/onboarding/mascot-backdrop.png" class="mascot-backdrop" alt="" aria-hidden="true">
          <div v-if="step === 1" class="sex-symbols" aria-hidden="true"><span class="male-symbol"><MarsIcon :size="24" /></span><span class="female-symbol"><VenusIcon :size="24" /></span></div>
          <img :src="step === 0 ? '/images/onboarding/welcome-hero.png' : step === 3 ? '/images/onboarding/ginger-measurements.png' : step === 5 ? '/images/onboarding/ginger-celebration-hooray.png' : `/images/onboarding/${step === 1 ? 'ginger-thinking-face' : step === 2 ? 'ginger-2-clean' : step === 3 ? 'ginger-3-clean' : 'ginger-final-face'}.webp`" :alt="['Рыжик улыбается и машет лапкой', 'Рыжик задумался, лапка у подбородка', 'Рыжик любопытно наклонил голову', 'Рыжик стоит на весах рядом с ростомером', 'Рыжик радостно тянет лапку вверх', 'Рыжик в праздничном колпачке поздравляет тебя, вокруг конфетти'][step]" class="cat-mascot" width="240" height="240">
          <div v-if="step === 0" class="hero-label nutrition-label"><FlameIcon :size="22" aria-hidden="true" /><span>Питание</span></div>
          <div v-if="step === 2" class="hero-label detail-label"><UserRoundIcon :size="20" aria-hidden="true" /><span>Знакомство</span></div>
          <div v-if="step === 3" class="hero-label detail-label"><RulerIcon :size="20" aria-hidden="true" /><span>Твоя точка старта</span></div>
          <div v-if="step === 4" class="hero-label detail-label"><TargetIcon :size="20" aria-hidden="true" /><span>Твоя цель</span></div>
          <div v-if="step === 0" class="hero-label activity-label"><FootprintsIcon :size="22" aria-hidden="true" /><span>Активность</span></div>
        </div>
        <div class="intro" aria-live="polite"><h1 ref="heading" tabindex="-1"><template v-if="step === 0">Привет, <br>я Рыжик!</template><template v-else>{{ titles[step] }}</template></h1><p v-if="step === 0" class="welcome-description">Твой помощник на пути<br>к здоровым привычкам.</p><p v-else-if="step !== 5">{{ descriptions[step] }}</p></div>
        <p v-if="step === 0" class="welcome-goal">Помогу дойти до твоей цели.</p>
        <div v-if="step === 1" class="fields sex-choice">
          <fieldset>
            <legend class="sr-only">Пол</legend><div class="sex-options">
              <label v-for="option in sexOptions" :key="option.id" class="sex-option" :class="{ selected: sexChosen && form.sex === option.id, female: option.id === 'female' }">
                <input type="radio" name="onboarding-sex" :value="option.id" :checked="sexChosen && form.sex === option.id" @change="chooseSex(option.id)">
                <span>{{ option.name }}</span>
              </label>
            </div>
          </fieldset>
        </div>
        <div v-if="step === 2" class="fields">
          <label for="name"><span class="field-label">Твоё имя</span><span class="input-shell"><UserRoundIcon :size="19" aria-hidden="true" /><input
            id="name"
            v-model="name"
            autocomplete="given-name"
            maxlength="60"
            placeholder="Введи имя"
            required
          ></span></label>
          <BirthDatePicker v-model="birthDate" :min="earliestBirth" :max="latestBirth" />
        </div>
        <div v-if="step === 3" class="fields">
          <label for="height" class="height-field"><span class="field-label">Рост, см</span><span class="input-shell height-shell"><RulerIcon :size="19" aria-hidden="true" /><input
            id="height"
            v-model="form.heightCm"
            type="number"
            inputmode="decimal"
            min="120"
            max="230"
            step="any"
            placeholder="Например, 170"
            required
          ></span></label>
          <div class="weight-fields">
            <WeightPicker id="weight" v-model="form.weightKg" label="Вес сейчас, кг" />
            <WeightPicker id="target-weight" v-model="targetWeight" label="Желаемый вес, кг" goal :initial="65" />
          </div>
        </div>
        <div v-if="step === 4" class="fields">
          <OptionPicker id="activity" v-model="form.activity" label="Твоя активность" :icon="FootprintsIcon" :options="activityChoices" />
          <OptionPicker id="goal" v-model="form.goal" label="Твоя цель" :icon="TargetIcon" :options="goalChoices" />
        </div>
        <div v-if="step === 5" class="completion-result" aria-live="polite">
          <p><strong>{{ calorieTarget?.toLocaleString('ru-RU') }}</strong><span><FlameIcon :size="24" aria-hidden="true" />ккал в день</span></p>
          <span class="completion-label">Твоя дневная норма</span>
        </div>
      </div>
      <div class="onboarding-footer"><p v-if="error" role="alert">{{ error }}</p><button class="continue" type="submit" :disabled="!canContinue || saving">{{ saving ? 'Сохраняем…' : step === 1 ? 'Далее' : step === 5 ? 'Начать' : 'Продолжить' }}<ArrowRightIcon v-if="!saving" :size="18" /></button></div>
    </form>
  </main>
</template>

<style scoped>
.onboarding { display:flex; flex-direction:column; background:var(--ios-background); color:var(--ios-label); padding:12px 24px 24px; }
.onboarding-top { display:grid; grid-template-columns:44px 1fr auto; column-gap:12px; align-items:center; height:44px; flex-shrink:0; }
.onboarding-top button { display:grid; place-items:center; width:44px; height:44px; margin-left:-10px; background:transparent; color:var(--ios-label); }
.back-space { width:44px; }
.step-count { font-size:12px; color:var(--ios-secondary); text-align:right; }
.step-dots { display:flex; justify-content:center; gap:7px; }
.step-dots span { width:26px; height:4px; border-radius:4px; background:var(--ios-fill); transition:background .2s; }
.step-dots .active { background:var(--ios-accent); }
.onboarding-body { display:flex; flex-direction:column; flex:1; min-height:calc(100% - 44px); }
.step-content { flex:1; display:flex; flex-direction:column; justify-content:center; padding:16px 0; }
.cat-scene { position:relative; display:flex; flex-direction:column; align-items:center; margin:8px 0 20px; }
.cat-mascot { position:relative; width:170px; height:170px; object-fit:contain; z-index:1; }
.measurements .cat-mascot,.introduction .cat-mascot,.final .cat-mascot { width:240px; height:240px; }
.cat-glow { position:absolute; top:18px; width:190px; height:150px; border-radius:50%; background:radial-gradient(ellipse, #ff9f0a18, transparent 70%); }
.intro { text-align:center; margin-bottom:24px; }.intro h1 { font-size:24px; font-weight:700; letter-spacing:-.6px; line-height:1.2; outline:none; }.intro p { margin:10px auto 0; max-width:295px; font-size:14px; line-height:1.5; color:var(--ios-secondary); }
.sex-choice { padding:8px 0 16px; }.sex-choice .sex-options .sex-option { min-height:56px; }
.fields { display:flex; flex-direction:column; gap:20px; }.fields label { display:flex; flex-direction:column; gap:8px; font-size:13px; font-weight:500; }.field-label { padding-left:2px; }.input-shell { display:flex; align-items:center; position:relative; min-height:54px; border:1px solid #ffffff0b; border-radius:16px; background:var(--ios-surface); padding-left:15px; }.input-shell > svg { color:var(--ios-secondary); flex-shrink:0; }.fields .input-shell input,.fields .input-shell select { width:100%; min-width:0; min-height:52px; border:0; border-radius:16px; padding:12px 14px 12px 12px; background:transparent; color:var(--ios-label); font-size:16px; font-weight:400; color-scheme:dark; box-shadow:none; outline:none; }.fields input::placeholder { color:#747479; }.input-shell:focus-within { border-color:var(--ios-accent); box-shadow:0 0 0 3px #0a84ff18; }.fields .input-shell select { appearance:none; padding-right:32px; }.fields select option { background:var(--ios-surface); }.select-chevron { position:absolute; right:14px; pointer-events:none; }.fields small,.field-note { font-weight:400; font-size:11px; line-height:1.5; color:var(--ios-secondary); }.fields fieldset { border:0; padding:0; }.fields legend { font-size:12px; margin-bottom:10px; color:var(--ios-secondary); }
.sex-options,.weight-fields { display:grid; grid-template-columns:1fr 1fr; gap:10px; }.sex-options .sex-option { position:relative; display:flex; flex-direction:row; justify-content:center; align-items:center; gap:8px; min-height:48px; border:1px solid #ffffff0b; border-radius:14px; padding:12px 9px; font-size:14px; background:var(--ios-surface); color:var(--ios-secondary); }.sex-option { cursor:pointer; }.sex-option input[type="radio"] { appearance:none; flex:0 0 18px; width:18px; height:18px; min-height:18px; border:1.5px solid currentColor; border-radius:50%; padding:0; display:grid; place-items:center; }.sex-option input[type="radio"]:checked::after { content:""; width:8px; height:8px; border-radius:50%; background:currentColor; }.sex-symbols { display:flex; justify-content:center; gap:28px; margin:0 auto 20px; }.sex-symbols > span { display:grid; place-items:center; width:68px; height:68px; border-radius:22px; }.male-symbol { background:var(--ios-blue-tint); color:var(--ios-blue); }.female-symbol { background:var(--ios-pink-tint); color:var(--ios-pink); }
.sex-options .selected { background:var(--ios-blue-tint); border-color:#0a84ff60; color:var(--ios-blue); }.sex-options .selected.female { background:var(--ios-pink-tint); border-color:#ff375f60; color:var(--ios-pink); }.weight-fields .input-shell { padding-left:10px; }.weight-fields .input-shell input { padding-left:8px; }.weight-fields .field-label { font-size:12px; }.calorie-result { display:flex; align-items:center; gap:14px; background:var(--ios-surface); border:1px solid #ffffff08; border-radius:18px; padding:18px; }.result-icon { display:grid; place-items:center; width:44px; height:44px; border-radius:14px; color:var(--ios-orange); background:var(--ios-orange-tint); }.calorie-result span { font-size:11px; color:var(--ios-secondary); }.calorie-result p { font-size:30px; font-weight:700; margin:3px 0; letter-spacing:-.8px; }.calorie-result small { font-size:14px; letter-spacing:0; }
.final-description { color:var(--ios-secondary); font-size:12px; line-height:1.5; text-align:center; max-width:295px; margin:0 auto; }
.calorie-result { position:relative; height:58px; border-radius:16px; background:var(--ios-surface); }.result-icon { position:absolute; top:10px; right:10px; display:grid; place-items:center; width:34px; height:34px; border-radius:11px; background:var(--ios-accent-tint); color:var(--ios-accent); }
.onboarding-footer { flex-shrink:0; padding-top:16px; }.continue { display:flex; justify-content:center; align-items:center; gap:12px; width:100%; min-height:54px; border-radius:999px; background:var(--ios-accent); color:var(--primary-foreground); font-size:15px; font-weight:600; }.continue:disabled { opacity:.4; }.onboarding-footer p { text-align:center; margin-top:12px; font-size:11px; color:var(--ios-secondary); }button:focus-visible { outline:2px solid var(--ios-accent); outline-offset:3px; }
@media (max-height:740px) { .cat-scene { margin:4px 0 16px; }.cat-mascot { width:142px; height:142px; }.measurements .cat-mascot,.introduction .cat-mascot,.final .cat-mascot { width:210px; height:210px; }.welcome .cat-mascot { width:210px; height:210px; }.intro { margin-bottom:20px; }.fields { gap:16px; }.welcome-features { gap:12px; }.onboarding-footer { padding-top:24px; } }
/* Welcome composition follows the selected mascot-led concept. */
.welcome-content { padding:8px 0 12px; }
.welcome { width:calc(100% + 16px); margin:0 -8px 14px; }
.welcome .cat-mascot { width:100%; height:auto; aspect-ratio:1.06; object-fit:contain; }
.hero-label { position:absolute; z-index:2; display:flex; align-items:center; gap:8px; padding:9px 13px; border-radius:999px; border:1px solid #ff9f0a35; background:#241706e6; color:var(--ios-label); font-size:13px; font-weight:600; }
.hero-label { color:var(--ios-accent); }
.hero-label svg { color:inherit; }
.nutrition-label { left:0; bottom:14%; }
.activity-label { right:0; top:9%; background:#17210fe6; border-color:#a4cf4c30; }
.activity-label { color:#b0db64; }
.welcome-content .intro { text-align:left; margin:0; padding:0 2px; }
.welcome-content .intro h1 { font-size:48px; line-height:1.04; letter-spacing:-1.3px; }
.welcome-content .intro p { max-width:none; margin:20px 0 0; font-size:18px; line-height:1.45; }
.welcome-goal { margin:24px 2px 0; color:var(--ios-secondary); font-size:14px; line-height:1.5; }
@media (max-height:600px) and (max-width:480px) { .welcome .cat-mascot { max-height:220px; }.welcome-content .intro h1 { font-size:32px; }.welcome-content .intro p { margin-top:12px; font-size:15px; }.welcome-goal { margin-top:14px; } }
/* Shared mascot-led styling for the remaining onboarding steps. */
.step-content:not(.welcome-content) .cat-scene { height:250px; margin:0 -8px 18px; justify-content:center; }
.step-content:not(.welcome-content) .cat-mascot { width:270px; height:250px; }
.mascot-backdrop { position:absolute; width:300px; height:270px; object-fit:contain; pointer-events:none; }
.step-content:not(.welcome-content) .intro { text-align:left; margin-bottom:22px; }
.step-content:not(.welcome-content) .intro h1 { font-size:36px; line-height:1.08; letter-spacing:-1px; max-width:320px; }
.step-content:not(.welcome-content) .intro p { font-size:15px; max-width:320px; margin:12px 0 0; }
.detail-label { left:0; bottom:8%; }
.sex-symbols { position:absolute; inset:8px 0 auto; z-index:2; display:flex; justify-content:space-between; margin:0; gap:0; }
.sex-symbols > span { width:48px; height:42px; border-radius:999px; border:1px solid #ffffff16; }
.sex-choice { padding:0; }
.sex-choice .sex-options .sex-option { border-radius:999px; min-height:56px; }
.fields .input-shell > svg { color:var(--ios-accent); }
.fields :deep(.input-shell) { border-radius:18px; border-color:#ffffff10; }
.fields :deep(.input-shell > svg) { color:var(--ios-accent); }
.fields :deep(.field-label) { color:var(--ios-secondary); }
.final-description { text-align:left; max-width:none; margin:0; font-size:13px; }
@media (max-height:600px) and (max-width:480px) { .step-content:not(.welcome-content) .cat-scene { height:170px; }.step-content:not(.welcome-content) .cat-mascot { width:190px; height:170px; }.mascot-backdrop { height:190px; }.step-content:not(.welcome-content) .intro h1 { font-size:30px; } }
.step-content.completion-content .intro { text-align:center; margin-bottom:10px; }
.step-content.completion-content .intro h1 { max-width:none; font-size:30px; letter-spacing:-.8px; }
.completion-result { margin-top:8px; padding:0 0 8px; text-align:center; }
.completion-label { display:block; margin-top:18px; color:var(--ios-secondary); font-size:15px; font-weight:500; }
.completion-result p { display:flex; flex-direction:column; align-items:center; gap:14px; margin:0; }
.completion-result strong { color:var(--ios-label); font-size:88px; line-height:1; letter-spacing:-3px; font-weight:750; font-variant-numeric:tabular-nums; }
.completion-result p span { display:flex; align-items:center; justify-content:center; gap:8px; color:var(--ios-accent); font-size:22px; font-weight:600; }
.step-transition { animation:step-arrive .32s cubic-bezier(.22,1,.36,1) both; }
@keyframes step-arrive { from { opacity:0; transform:translateX(calc(var(--step-direction) * 16px)); } to { opacity:1; transform:translateX(0); } }
@media (prefers-reduced-motion:reduce) { .step-transition { animation:none; } }
@media (prefers-reduced-motion:reduce) { .step-dots span { transition:none; } }
</style>
