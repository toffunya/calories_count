import type { Entry, Profile } from '@/shared/db';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import { saveProfile, setTargetWeight } from '@/entities/profile';
import { useLiveQuery } from '@/shared/lib';
import StatsView from './index.vue';

vi.mock('vue-router', () => ({ RouterLink: { template: '<a><slot /></a>' } }));

vi.mock('@/entities/profile', async importOriginal => ({
  ...await importOriginal<typeof import('@/entities/profile')>(),
  loadProfile: vi.fn(),
  saveProfile: vi.fn(),
  setTargetWeight: vi.fn(),
}));

vi.mock('@/shared/lib', async importOriginal => ({
  ...await importOriginal<typeof import('@/shared/lib')>(),
  useLiveQuery: vi.fn(),
}));

const entries = ref<Entry[]>([]);
const profile = ref<Profile | undefined>(undefined);

function entry(date: string, kcal: number): Entry {
  return {
    id: `entry-${date}`,
    date,
    createdAt: Date.parse(`${date}T09:00:00`),
    foodId: 'rice-beef',
    qty: 1,
    kcalPerPortion: kcal,
    name: 'Рис с говядиной',
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 7, 19, 12, 0));
  entries.value = [];
  profile.value = { targetKcal: 2400, weightKg: 72, heightCm: 170, age: 25, targetWeightKg: 65 } as Profile;
  vi.mocked(useLiveQuery).mockImplementation(
    (_querier, initial) => (Array.isArray(initial) ? entries : profile) as never,
  );
});

afterEach(() => {
  vi.useRealTimers();
});

describe('экран статистики', () => {
  it('показывает месячный календарь', async () => {
    const wrapper = mount(StatsView);
    await wrapper.get('[role="tab"][aria-selected="false"]').trigger('click');
    expect(wrapper.text()).toContain('Август 2026');
    expect(wrapper.get('[aria-label="Календарь"]').findAll('button')).toHaveLength(31);
  });

  it('считает итоги только по дням с записями', async () => {
    entries.value = [entry('2026-08-18', 2000), entry('2026-08-19', 3000)];
    const wrapper = mount(StatsView);
    await wrapper.get('[role="tab"][aria-selected="false"]').trigger('click');
    const text = wrapper.text();
    expect(text).toContain('2 500 ккал');
    expect(text).toContain('5 000 ккал');
    expect(text).toContain('2 дня с записями');
  });

  it('переключает месяц назад в календаре калорий', async () => {
    const wrapper = mount(StatsView);
    await wrapper.get('[role="tab"][aria-selected="false"]').trigger('click');
    await wrapper.get('[aria-label="Предыдущий период"]').trigger('click');
    expect(wrapper.text()).toContain('Июль 2026');
  });

  it('показывает текущий вес, диапазон по росту и цель', () => {
    const wrapper = mount(StatsView);
    expect(wrapper.text()).toContain('72 кг');
    expect(wrapper.text()).toContain('53–72 кг');
    expect(wrapper.text()).toContain('65 кг');
    expect(wrapper.text()).toContain('История веса');
  });

  it('выделяет выбранный день', async () => {
    const wrapper = mount(StatsView);
    await wrapper.get('[role="tab"][aria-selected="false"]').trigger('click');
    const firstDay = wrapper.get('[aria-label="Календарь"]').findAll('button')[0];
    await firstDay.trigger('click');
    expect(firstDay.attributes('aria-pressed')).toBe('true');
  });
  it('не применяет взрослый диапазон к возрасту до 20 лет', () => {
    profile.value = { ...profile.value!, age: 19 };
    const wrapper = mount(StatsView);
    expect(wrapper.text()).toContain('взрослый диапазон ИМТ не применяется');
    expect(wrapper.text()).not.toContain('53–72 кг');
  });
  it('сохраняет измерение и личную цель без изменения остальных параметров', async () => {
    const wrapper = mount(StatsView);
    const fields = wrapper.findAll('input[type="number"]');
    await fields[0].setValue('71.5');
    await fields[1].setValue('64');
    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(saveProfile).toHaveBeenCalledWith(expect.objectContaining({ weightKg: 71.5, heightCm: 170, age: 25 }));
    expect(setTargetWeight).toHaveBeenCalledWith(64);
  });
  it('не сохраняет некорректное измерение', async () => {
    const wrapper = mount(StatsView);
    await wrapper.find('input[type="number"]').setValue('-1');
    await wrapper.get('form').trigger('submit');
    expect(saveProfile).not.toHaveBeenCalled();
  });
});
