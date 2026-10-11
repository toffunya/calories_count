import { flushPromises, mount } from '@vue/test-utils';
import { addEntries } from '@/entities/entry';
import CatalogView from './index.vue';
import CartPanel from './ui/CartPanel.vue';

const { push, route } = vi.hoisted(() => ({ push: vi.fn(), route: { query: {} as Record<string, string> } }));
vi.mock('vue-router', async importOriginal => ({
  ...await importOriginal<typeof import('vue-router')>(),
  useRoute: () => route,
  useRouter: () => ({ push }),
}));
vi.mock('@/entities/food/lib/use-custom-foods', async () => {
  const { ref } = await import('vue');
  return { useCustomFoods: () => ref([]) };
});
vi.mock('@/entities/entry', async importOriginal => ({
  ...await importOriginal<typeof import('@/entities/entry')>(),
  addEntries: vi.fn(),
}));
function render() {
  return mount(CatalogView, { global: { stubs: { RouterLink: { template: '<a><slot /></a>' }, Teleport: true, BarcodeScanner: true } } });
}
async function clickText(wrapper: ReturnType<typeof render>, text: string) {
  await wrapper.findAll('button').find(button => button.text() === text)!.trigger('click');
}
beforeEach(() => {
  route.query = {};
});

describe('каталог рецептов и продуктов', () => {
  it('показывает два маленьких рецепта, затем один широкий', () => {
    const wrapper = render();
    expect(wrapper.findAll('.recipe-card').map(card => card.classes().includes('wide'))).toEqual([false, false, true, false, false, true]);
    expect(wrapper.text()).not.toContain('Что приготовить');
    expect(wrapper.find('[aria-label="Назад"]').exists()).toBe(false);
  });
  it('переключает категории продуктов и ищет внутри категории', async () => {
    const wrapper = render();
    await clickText(wrapper, 'Продукты');
    expect(wrapper.findAll('img')).toHaveLength(6);
    expect(wrapper.findAll('.recipe-card')).toHaveLength(0);
    await clickText(wrapper, 'Фрукты');
    expect(wrapper.findAll('img').map(img => img.attributes('alt'))).toEqual(['Банан', 'Яблоко']);
    await wrapper.find('input[type="search"]').setValue('яблоко');
    expect(wrapper.findAll('img')).toHaveLength(1);
  });
  it('сохраняет выбранную порцию и БЖУ на запрошенную дату', async () => {
    const previous = '2026-01-01';
    route.query = { date: previous };
    const wrapper = render();
    await clickText(wrapper, 'Продукты');
    await wrapper.find('button[aria-label="Добавить порцию: Греческий йогурт 0%"]').trigger('click');
    expect(wrapper.find('.product-card.selected').exists()).toBe(true);
    await wrapper.findComponent(CartPanel).vm.$emit('confirm');
    await flushPromises();
    expect(addEntries).toHaveBeenCalledWith(previous, [expect.objectContaining({ foodId: 'product-greek-yogurt', qty: 1, amount: 150, kcalPerPortion: 89, nutrients: expect.objectContaining({ protein: 15.3 }) })]);
    expect(push).toHaveBeenCalledWith({ path: '/', query: { date: previous } });
  });
  it('кнопки позволяют добавить порции и убрать продукт из корзины', async () => {
    const wrapper = render();
    await clickText(wrapper, 'Продукты');
    await wrapper.find('button[aria-label="Добавить порцию: Банан"]').trigger('click');
    await wrapper.find('button[aria-label="Добавить порцию: Банан"]').trigger('click');
    expect(wrapper.findComponent(CartPanel).props('items')[0].qty).toBe(2);
    await wrapper.find('button[aria-label="Убрать порцию: Банан"]').trigger('click');
    await wrapper.find('button[aria-label="Убрать порцию: Банан"]').trigger('click');
    expect(wrapper.findComponent(CartPanel).exists()).toBe(false);
    expect(addEntries).not.toHaveBeenCalled();
  });
});

it('показывает иллюстрацию при пустом результате и сбрасывает запрос', async () => {
  const wrapper = render();
  await clickText(wrapper, 'Продукты');
  await wrapper.find('input[type="search"]').setValue('несуществующий продукт');
  expect(wrapper.find('[role="img"][aria-label="Лупа над пустой корзинкой"]').exists()).toBe(true);
  expect(wrapper.findAll('.product-card')).toHaveLength(0);
  await clickText(wrapper, 'Сбросить поиск');
  expect(wrapper.findAll('.product-card')).toHaveLength(6);
  wrapper.unmount();
});

it('сохраняет историю между открытиями, повторяет и очищает запросы', async () => {
  const stored = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value) });
  let wrapper = render();
  try {
    await clickText(wrapper, 'Продукты');
    await wrapper.find('input[type="search"]').setValue('яблоко');
    await wrapper.find('input[type="search"]').trigger('blur');
    wrapper.unmount();
    wrapper = render();
    await clickText(wrapper, 'Продукты');
    await wrapper.find('input[type="search"]').trigger('focus');
    expect(wrapper.find('.search-history').text()).toContain('яблоко');
    await clickText(wrapper, 'яблоко');
    expect(wrapper.findAll('.product-card')).toHaveLength(1);
    await wrapper.find('button[aria-label="Очистить поиск"]').trigger('click');
    await wrapper.find('input[type="search"]').trigger('focus');
    await wrapper.find('button[aria-label="Очистить историю"]').trigger('click');
    expect(wrapper.findAll('.history-item')).toHaveLength(0);
    expect(JSON.parse(stored.get('catalog-search-history-v1')!).products).toEqual([]);
  }
  finally {
    wrapper.unmount();
    vi.unstubAllGlobals();
  }
});

it('фильтрует молочные, протеиновые и ПП продукты', async () => {
  const wrapper = render();
  await clickText(wrapper, 'Продукты');
  await clickText(wrapper, 'Молочные продукты');
  expect(wrapper.findAll('.product-card img').map(img => img.attributes('alt'))).toEqual(['Греческий йогурт 0%']);
  await clickText(wrapper, 'Протеиновое');
  expect(wrapper.findAll('.product-card img').map(img => img.attributes('alt'))).toEqual(['Греческий йогурт 0%', 'Миндаль']);
  await clickText(wrapper, 'ПП');
  expect(wrapper.findAll('.product-card')).toHaveLength(3);
  wrapper.unmount();
});

it('возвращает фильтры рецептов и коллекцию Мои', async () => {
  const wrapper = render();
  await clickText(wrapper, 'До 400 ккал');
  expect(wrapper.findAll('.recipe-card')).toHaveLength(1);
  await clickText(wrapper, 'Мои');
  expect(wrapper.text()).toContain('Здесь будут твои блюда');
  expect(wrapper.findAll('.recipe-card')).toHaveLength(0);
  wrapper.unmount();
});

it('запускает нужное сканирование из поиска, сохраняя дату', async () => {
  route.query = { date: '2026-01-01' };
  const wrapper = render();
  await wrapper.find('button[aria-label="Сканировать еду"]').trigger('click');
  expect(push).toHaveBeenCalledWith({ path: '/add/custom', query: { date: '2026-01-01', capture: 'food' } });
  await clickText(wrapper, 'Продукты');
  await wrapper.find('button[aria-label="Сканировать штрихкод"]').trigger('click');
  expect(wrapper.find('barcode-scanner-stub').exists()).toBe(true);
  wrapper.unmount();
});

it('удаляет отдельный чип истории, сохраняя остальные запросы', async () => {
  const stored = new Map([['catalog-search-history-v1', JSON.stringify({ recipes: [], products: ['яблоко', 'банан'] })]]);
  vi.stubGlobal('localStorage', { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value) });
  const wrapper = render();
  try {
    await clickText(wrapper, 'Продукты');
    await wrapper.find('input[type="search"]').trigger('focus');
    await wrapper.find('button[aria-label="Удалить запрос: яблоко"]').trigger('click');
    expect(wrapper.findAll('.history-item').map(item => item.text())).toEqual(['банан']);
    expect(JSON.parse(stored.get('catalog-search-history-v1')!).products).toEqual(['банан']);
    await wrapper.find('button[aria-label="Закрыть историю поиска"]').trigger('click');
    expect(wrapper.find('.search-history').exists()).toBe(false);
  }
  finally {
    wrapper.unmount();
    vi.unstubAllGlobals();
  }
});
