import { flushPromises, mount } from '@vue/test-utils';
import WeightPicker from './WeightPicker.vue';

async function open() {
  const wrapper = mount(WeightPicker, { props: { id: 'test-weight', label: 'Вес', modelValue: '65.5' }, global: { stubs: { DialogPortal: { template: '<slot />' } } } });
  await wrapper.find('#test-weight').trigger('click');
  await flushPromises();
  return wrapper;
}
it('отмена не сохраняет изменения веса', async () => {
  const wrapper = await open();
  await wrapper.find('.weight-ruler').trigger('keydown', { key: 'PageUp' });
  await wrapper.findAll('button').find(button => button.text() === 'Отмена')!.trigger('click');
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});
it('прокрутка сохраняет десятые доли килограмма', async () => {
  const wrapper = await open();
  const wheel = wrapper.find('.weight-ruler');
  (wheel.element as HTMLElement).scrollLeft = 407 * 8;
  await wheel.trigger('scroll');
  await wrapper.findAll('button').find(button => button.text() === 'Готово')!.trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['70.7']);
});
it('клавиатура ограничивает вес диапазоном 30–300', async () => {
  const wrapper = await open();
  const wheel = wrapper.find('.weight-ruler');
  await wheel.trigger('keydown', { key: 'Home' });
  await wheel.trigger('keydown', { key: 'ArrowLeft' });
  expect(wheel.attributes('aria-valuenow')).toBe('30');
  await wheel.trigger('keydown', { key: 'End' });
  await wheel.trigger('keydown', { key: 'ArrowRight' });
  expect(wheel.attributes('aria-valuenow')).toBe('300');
});

it('сохраняет значение после шага клавиатурой', async () => {
  const wrapper = await open();
  await wrapper.find('.weight-ruler').trigger('keydown', { key: 'ArrowRight' });
  await wrapper.findAll('button').find(button => button.text() === 'Готово')!.trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['65.6']);
});
