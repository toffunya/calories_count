import { flushPromises, mount } from '@vue/test-utils';
import { saveProfile } from '@/entities/profile';
import OnboardingView from './index.vue';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/entities/profile', async importOriginal => ({ ...await importOriginal<typeof import('@/entities/profile')>(), saveProfile: vi.fn() }));

const today = new Date();
const birthDate = `${today.getFullYear() - 30}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

async function next(wrapper: ReturnType<typeof mount>) {
  if (wrapper.find('.sex-choice').exists()) {
    await wrapper.find('.sex-options input').setValue(true);
    await wrapper.find('form').trigger('submit');
  }
  else {
    await wrapper.find('form').trigger('submit');
  }
}
async function pickBirthday(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('#birth-date').trigger('click');
  await flushPromises();
  await vi.waitFor(() => expect(wrapper.find('[role="spinbutton"]').exists()).toBe(true));
  const year = wrapper.find('[role="spinbutton"][aria-label="Год"]');
  for (let i = 0; i < 5; i++) {
    await year.trigger('keydown', { key: 'ArrowUp' });
    await wrapper.vm.$nextTick();
  }
  const done = wrapper.findAll('button').find(button => button.text() === 'Готово')!;
  await done.trigger('click');
  await wrapper.vm.$nextTick();
}
async function pickWeight(wrapper: ReturnType<typeof mount>, id: string, kg: number) {
  await wrapper.find(`#${id}`).trigger('click');
  await flushPromises();
  const wheel = wrapper.find('.weight-ruler');
  (wheel.element as HTMLElement).scrollLeft = (kg - 30) * 10 * 8;
  await wheel.trigger('scroll');
  await wrapper.findAll('button').find(button => button.text() === 'Готово')!.trigger('click');
  await flushPromises();
}
async function details(wrapper: ReturnType<typeof mount>) {
  await next(wrapper);
  await next(wrapper);
  await wrapper.find('#name').setValue('Аня');
  await pickBirthday(wrapper);
  await next(wrapper);
  await wrapper.find('#height').setValue('180');
  await pickWeight(wrapper, 'weight', 85);
  await pickWeight(wrapper, 'target-weight', 75);
}
describe('онбординг из шести шагов', () => {
  it('начинается с приветствия и не сохраняет профиль на промежуточном шаге', async () => {
    const wrapper = mount(OnboardingView, { global: { stubs: { DialogPortal: { template: '<slot />' } } } });
    expect(wrapper.text()).toContain('Привет, я Рыжик!');
    await next(wrapper);
    expect(wrapper.find('.sex-choice').exists()).toBe(true);
    expect(wrapper.find('#name').exists()).toBe(false);
    await next(wrapper);
    expect(wrapper.find('#name').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    await next(wrapper);
    expect(saveProfile).not.toHaveBeenCalled();
  });
  it('не пропускает без даты рождения', async () => {
    const wrapper = mount(OnboardingView, { global: { stubs: { DialogPortal: { template: '<slot />' } } } });
    await next(wrapper);
    await next(wrapper);
    await wrapper.find('#name').setValue('Аня');
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    await pickBirthday(wrapper);
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });
  it('отдельный экран выбора пола открывает знакомство и сохраняется при возврате', async () => {
    const wrapper = mount(OnboardingView, { global: { stubs: { DialogPortal: { template: '<slot />' } } } });
    expect(wrapper.find('.sex-choice').exists()).toBe(false);
    await next(wrapper);
    expect(wrapper.find('button[type="submit"]').text()).toContain('Далее');
    await wrapper.findAll('.sex-options input')[1].setValue(true);
    expect(wrapper.find('#birth-date').exists()).toBe(false);
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('#birth-date').exists()).toBe(true);
    await wrapper.find('button[aria-label="Назад"]').trigger('click');
    expect((wrapper.findAll('.sex-options input')[1].element as HTMLInputElement).checked).toBe(true);
  });
  it('сохраняет данные при возврате назад', async () => {
    const wrapper = mount(OnboardingView, { global: { stubs: { DialogPortal: { template: '<slot />' } } } });
    await details(wrapper);
    await wrapper.find('button[aria-label="Назад"]').trigger('click');
    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe('Аня');
    await next(wrapper);
    expect(wrapper.find('#target-weight').text()).toContain('75');
  });
  it('начинает выбор желаемого веса с 65 кг независимо от текущего', async () => {
    const wrapper = mount(OnboardingView, { global: { stubs: { DialogPortal: { template: '<slot />' } } } });
    await next(wrapper);
    await next(wrapper);
    await wrapper.find('#name').setValue('Аня');
    await pickBirthday(wrapper);
    await next(wrapper);
    await pickWeight(wrapper, 'weight', 98);
    await wrapper.find('#target-weight').trigger('click');
    await flushPromises();
    expect(wrapper.find('.weight-display').text()).toContain('65,0');
    await wrapper.findAll('button').find(button => button.text() === 'Отмена')!.trigger('click');
    await pickWeight(wrapper, 'target-weight', 70);
    await pickWeight(wrapper, 'weight', 100);
    await wrapper.find('#target-weight').trigger('click');
    await flushPromises();
    expect(wrapper.find('.weight-display').text()).toContain('70,0');
  }, 15000);
  it('проверяет измерения и сохраняет весь профиль только в конце', async () => {
    const wrapper = mount(OnboardingView, { global: { stubs: { DialogPortal: { template: '<slot />' } } } });
    await details(wrapper);
    await wrapper.find('#height').setValue('0');
    await next(wrapper);
    expect(wrapper.find('#weight').exists()).toBe(true);
    await wrapper.find('#height').setValue('180');
    await next(wrapper);
    expect(wrapper.find('h1').text()).toBe('В твоём ритме');
    await wrapper.find('#activity').trigger('click');
    await flushPromises();
    await wrapper.find('[data-option="sedentary"]').trigger('click');
    await wrapper.find('#goal').trigger('click');
    await flushPromises();
    await wrapper.find('[data-option="maintain"]').trigger('click');
    await next(wrapper);
    expect(wrapper.find('h1').text()).toBe('Ура, всё готово!');
    const maintainKcal = Number(wrapper.find('.completion-result strong').text().replace(/\s/g, ''));
    expect(maintainKcal).toBeGreaterThan(0);
    expect(saveProfile).not.toHaveBeenCalled();
    await wrapper.find('button[aria-label="Назад"]').trigger('click');
    await wrapper.find('#goal').trigger('click');
    await flushPromises();
    await wrapper.find('[data-option="cutMild"]').trigger('click');
    await next(wrapper);
    expect(Number(wrapper.find('.completion-result strong').text().replace(/\s/g, ''))).toBeLessThan(maintainKcal);
    await wrapper.find('button[aria-label="Назад"]').trigger('click');
    await wrapper.find('#goal').trigger('click');
    await flushPromises();
    await wrapper.find('[data-option="maintain"]').trigger('click');
    await next(wrapper);
    await next(wrapper);
    expect(saveProfile).toHaveBeenCalledWith({ name: 'Аня', birthDate, sex: 'male', age: 30, heightCm: 180, weightKg: 85, targetWeightKg: 75, activity: 'sedentary', goal: 'maintain' });
    expect(push).toHaveBeenCalledWith('/');
  });
});
