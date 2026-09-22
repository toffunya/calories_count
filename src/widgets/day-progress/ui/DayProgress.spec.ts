import { mount } from '@vue/test-utils';
import DayProgress from './DayProgress.vue';

function mountProgress(eaten: number, target: number) {
  return mount(DayProgress, { props: { eaten, target } });
}

describe('прогресс калорий за день', () => {
  it('показывает съеденное и цель', () => {
    const wrapper = mountProgress(1200, 2410);

    expect(wrapper.text()).toContain('1 200');
    expect(wrapper.text()).toContain('2 410');
  });

  it('под целью показывает остаток', () => {
    const wrapper = mountProgress(1200, 2000);

    expect(wrapper.text()).toContain('Daily calories');
    expect(wrapper.text()).toContain('800');
  });

  it('над целью показывает перебор', () => {
    const wrapper = mountProgress(2500, 2000);

    expect(wrapper.text()).toContain('Over target');
    expect(wrapper.text()).not.toContain('Remaining');
    expect(wrapper.text()).toContain('500');
  });

  it('выделяет превышение красным', () => {
    expect(mountProgress(1200, 2000).find('progress').classes()).not.toContain('is-over');
    expect(mountProgress(2500, 2000).find('progress').classes()).toContain('is-over');
  });

  it('не заполняет прогресс больше 100 процентов', () => {
    const progress = mountProgress(10_000, 2000).find('progress');

    expect(progress.attributes('value')).toBe('100');
  });

  it('показывает процент дневной цели', () => {
    const wrapper = mountProgress(1200, 2000);

    expect(wrapper.find('progress').attributes('aria-label')).toBe('60% of daily target');
  });

  it('использует один компактный блок вместо круговой диаграммы', () => {
    const wrapper = mountProgress(1200, 2000);

    expect(wrapper.find('progress').exists()).toBe(true);
    expect(wrapper.find('svg[viewBox="0 0 120 120"]').exists()).toBe(false);
  });

  it('сохраняет основные показатели', () => {
    const text = mountProgress(1200, 2000).text();

    expect(text).toContain('Eaten');
    expect(text).toContain('Daily goal');
  });

  it('не падает при нулевой цели', () => {
    const wrapper = mountProgress(500, 0);

    expect(wrapper.text()).toContain('500');
    expect(wrapper.find('progress').attributes('value')).toBe('0');
  });
});
