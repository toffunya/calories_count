import { FootprintsIcon } from '@lucide/vue';
import { flushPromises, mount } from '@vue/test-utils';
import OptionPicker from './OptionPicker.vue';

it('показывает выбранный вариант и сохраняет новый выбор', async () => {
  const wrapper = mount(OptionPicker, { props: { id: 'activity', label: 'Активность', icon: FootprintsIcon, modelValue: 'light', options: [{ id: 'light', name: 'Лёгкая', hint: '1–3 раза' }, { id: 'high', name: 'Высокая', hint: '6–7 раз' }] }, global: { stubs: { DialogPortal: { template: '<slot />' } } } });
  expect(wrapper.find('#activity').text()).toBe('Лёгкая');
  await wrapper.find('#activity').trigger('click');
  await flushPromises();
  expect(wrapper.find('[data-option="light"]').attributes('aria-checked')).toBe('true');
  await wrapper.find('[data-option="high"]').trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['high']);
  expect(wrapper.find('#activity').attributes('aria-expanded')).toBe('false');
});
