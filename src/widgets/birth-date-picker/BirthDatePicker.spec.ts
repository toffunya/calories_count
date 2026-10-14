import { flushPromises, mount } from '@vue/test-utils';
import BirthDatePicker from './BirthDatePicker.vue';

async function open(value: string) {
  const wrapper = mount(BirthDatePicker, { global: { stubs: { DialogPortal: { template: '<slot />' } } }, props: { modelValue: value, min: '1925-01-01', max: '2012-12-31' } });
  await wrapper.find('#birth-date').trigger('click');
  await flushPromises();
  await vi.waitFor(() => expect(wrapper.find('[role="spinbutton"]').exists()).toBe(true));
  return wrapper;
}
async function button(wrapper: ReturnType<typeof mount>, text: string) {
  await wrapper.findAll('button').find(item => item.text() === text)!.trigger('click');
  await flushPromises();
}
describe('колёсики даты рождения', () => {
  it('отмена не изменяет сохранённую дату', async () => {
    const wrapper = await open('2000-01-31');
    await wrapper.find('[aria-label="Месяц"]').trigger('keydown', { key: 'ArrowDown' });
    await button(wrapper, 'Отмена');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
  it('корректирует день для февраля и високосного года', async () => {
    const wrapper = await open('2000-01-31');
    await wrapper.find('[aria-label="Месяц"]').trigger('keydown', { key: 'ArrowDown' });
    await flushPromises();
    expect(wrapper.find('[aria-label="День"]').attributes('aria-valuenow')).toBe('29');
    await wrapper.find('[aria-label="Год"]').trigger('keydown', { key: 'ArrowDown' });
    await flushPromises();
    expect(wrapper.find('[aria-label="День"]').attributes('aria-valuenow')).toBe('28');
    await button(wrapper, 'Готово');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2001-02-28']);
  });
  it('прокрутка меняет выбранный день и готово сохраняет его', async () => {
    const wrapper = await open('2000-01-15');
    const wheel = wrapper.find('[aria-label="День"]');
    (wheel.element as HTMLElement).scrollTop = 19 * 44;
    await wheel.trigger('scroll');
    await button(wrapper, 'Готово');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2000-01-20']);
  });
});
