import type { WalkRecord } from '@/shared/db';
import { ref } from 'vue';
import { db } from '@/shared/db';
import { toDateKey } from '@/shared/lib';
import { estimateWalkingKcal, finishWalk, startWalk } from './health';
import { StepDetector } from './step-detector';

export const tracking = ref(false);
export const stepStatus = ref('Телефон считает шаги, пока приложение открыто.');
const detector = new StepDetector();
let session: WalkRecord | undefined;
let weight = 70;
let queue = Promise.resolve();
let timeout: ReturnType<typeof setTimeout> | undefined;
let installed = false;
function persist(record: WalkRecord) {
  queue = queue.then(async () => {
    await db.walks.put(record);
  }).catch(() => {
    stepStatus.value = 'Не удалось сохранить шаги. Остановите прогулку и попробуйте снова.';
  });
}
function motion(event: DeviceMotionEvent) {
  const a = event.accelerationIncludingGravity;
  if (!tracking.value || !session || a?.x == null || a.y == null || a.z == null)
    return;
  clearTimeout(timeout);
  if (session.date !== toDateKey()) {
    void stopStepTracking();
    return;
  }
  stepStatus.value = 'Датчик подключён · идёт подсчёт';
  const count = detector.sample(a.x, a.y, a.z, event.timeStamp);
  if (count) {
    session = { ...session, steps: session.steps + count };
    session.burnedKcal = estimateWalkingKcal(session.steps, weight);
    persist({ ...session });
  }
}
export async function startStepTracking(weightKg: number) {
  if (tracking.value)
    return;
  if (!window.isSecureContext) {
    stepStatus.value = 'Для датчика откройте приложение по HTTPS на телефоне.';
    return;
  }
  if (!('DeviceMotionEvent' in window)) {
    stepStatus.value = 'Этот браузер не поддерживает датчик движения. Можно внести шаги вручную.';
    return;
  }
  try {
    const api = DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<string> };
    if (api.requestPermission && await api.requestPermission() !== 'granted') {
      stepStatus.value = 'Доступ к движению не разрешён. Разрешите его в настройках браузера.';
      return;
    }
    weight = weightKg;
    session = await startWalk();
    detector.reset();
    tracking.value = true;
    stepStatus.value = 'Ожидаем датчик · начните ходьбу';
    window.addEventListener('devicemotion', motion);
    timeout = setTimeout(() => {
      stepStatus.value = 'Нет данных датчика. Попробуйте на телефоне или внесите шаги вручную.';
      void stopStepTracking(false);
    }, 8000);
  }
  catch {
    stepStatus.value = 'Не удалось включить датчик. Проверьте разрешение и попробуйте снова.';
  }
}
export async function stopStepTracking(showMessage = true) {
  tracking.value = false;
  clearTimeout(timeout);
  window.removeEventListener('devicemotion', motion);
  const record = session;
  session = undefined;
  await queue;
  if (record) {
    try {
      await finishWalk(record.id, record.steps, weight);
    }
    catch {
      stepStatus.value = 'Не удалось завершить сохранение прогулки.';
      return;
    }
  }
  if (showMessage)
    stepStatus.value = 'Прогулка сохранена. Подсчёт остановлен.';
}
export function installStepTrackingLifecycle() {
  if (installed)
    return;
  installed = true;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && tracking.value) {
      stepStatus.value = 'Подсчёт приостановлен: приложение было скрыто. Нажмите «Начать», чтобы продолжить.';
      void stopStepTracking(false);
    }
  });
  window.addEventListener('pagehide', () => {
    if (tracking.value)
      void stopStepTracking(false);
  });
}
