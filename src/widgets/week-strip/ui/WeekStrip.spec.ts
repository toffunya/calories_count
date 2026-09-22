import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import WeekStrip from './WeekStrip.vue';

function mountStrip(selected = '2026-08-19', gestureArea?: HTMLElement, totals?: Map<string, number>) {
  return mount(WeekStrip, { props: { modelValue: selected, gestureArea, totals, target: 2000 } });
}

function weekBlocks(wrapper: VueWrapper) {
  return wrapper.findAll('[role="group"] > div');
}

function dayButtons(wrapper: VueWrapper, week?: number) {
  const blocks = weekBlocks(wrapper);

  return blocks[week ?? blocks.length - 1].findAll('button');
}

function labels(wrapper: VueWrapper, week?: number) {
  return dayButtons(wrapper, week).map(button => button.findAll('span')[0].text());
}

function numbers(wrapper: VueWrapper, week?: number) {
  return dayButtons(wrapper, week).map(button => button.findAll('span')[1].text());
}

describe('лента недели', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 19, 15, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('показывает по три дня вокруг сегодня', () => {
    expect(numbers(mountStrip())).toEqual(['16', '17', '18', '19', '20', '21', '22']);
  });

  it('называет сегодня словом, остальные дни — днём недели', () => {
    const week = labels(mountStrip());

    expect(week[3]).toBe('Today');
    expect(week[0]).toBe('Sun');
  });

  it('отдаёт выбранный день по тапу', async () => {
    const wrapper = mountStrip();

    await dayButtons(wrapper)[1].trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-08-17']]);
  });

  it('не пускает в будущее', () => {
    const week = dayButtons(mountStrip());

    expect(week[3].attributes('disabled')).toBeUndefined();
    expect(week[4].attributes('disabled')).toBeDefined();
    expect(week[6].attributes('disabled')).toBeDefined();
  });

  it('не показывает кольцо для пустого прошлого дня', () => {
    const yesterday = dayButtons(mountStrip())[2];

    expect(yesterday.find('svg').exists()).toBe(false);
  });

  it('не показывает кольцо даже когда в прошлом дне есть калории', () => {
    const totals = new Map([['2026-08-18', 1000]]);
    const yesterday = dayButtons(mountStrip('2026-08-19', undefined, totals))[2];

    expect(yesterday.find('svg').exists()).toBe(false);
  });

  it('помечает выбранный день', () => {
    const marked = mountStrip('2026-08-18').findAll('[aria-current="date"]');

    expect(marked).toHaveLength(1);
    expect(marked[0].attributes('aria-label')).toContain('August 18');
  });

  it('держит наготове полгода истории', () => {
    expect(weekBlocks(mountStrip())).toHaveLength(26);
  });

  it('колесом над переданной областью двигает выбор на день назад', () => {
    const area = document.createElement('div');
    const wrapper = mountStrip('2026-08-19', area);

    area.dispatchEvent(new WheelEvent('wheel', { deltaY: -120 }));

    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-08-18']]);
  });

  it('не уводит выбор в будущее', () => {
    const area = document.createElement('div');
    const wrapper = mountStrip('2026-08-19', area);

    area.dispatchEvent(new WheelEvent('wheel', { deltaY: 120 }));

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('доматывает историю до выбранного дня', () => {
    const wrapper = mountStrip('2025-08-19');

    expect(numbers(wrapper, 0)).toEqual(['17', '18', '19', '20', '21', '22', '23']);
    expect(wrapper.find('[aria-current="date"]').attributes('aria-label')).toContain('August 19');
  });
});
