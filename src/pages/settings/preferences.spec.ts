import type { Profile } from '@/shared/db';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { setManualTarget } from '@/entities/profile';
import { setLocale, useLiveQuery } from '@/shared/lib';
import PreferencesView from './preferences.vue';

vi.mock('vue-router', () => ({
  RouterLink: { template: '<a><slot /></a>' },
  useRoute: () => ({ hash: '' }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/entities/profile', async importOriginal => ({
  ...await importOriginal<typeof import('@/entities/profile')>(),
  loadProfile: vi.fn(),
  setManualTarget: vi.fn(),
}));

vi.mock('@/shared/lib', async importOriginal => ({
  ...await importOriginal<typeof import('@/shared/lib')>(),
  useLiveQuery: vi.fn(),
}));

const profile = ref<Profile>({
  id: 'me',
  sex: 'female',
  age: 22,
  heightCm: 162,
  weightKg: 85,
  activity: 'moderate',
  goal: 'cutMild',
  targetKcal: 2100,
  targetOverridden: false,
  createdAt: 1,
  updatedAt: 1,
});

beforeEach(() => {
  setLocale('ru');
  vi.mocked(useLiveQuery).mockReturnValue(profile);
});

describe('настройки профиля', () => {
  it('переключает язык интерфейса', async () => {
    const wrapper = mount(PreferencesView);
    await wrapper.findElementByText('button', 'English').trigger('click');

    expect(wrapper.text()).toContain('Settings');
    expect(wrapper.text()).toContain('Personal data');
  });

  it('не показывает поля, пока раздел не открыт', async () => {
    const wrapper = mount(PreferencesView);
    expect(wrapper.find('#weight').exists()).toBe(false);

    await wrapper.get('[data-testid="profile-settings"]').trigger('click');
    expect((wrapper.find('#weight').element as HTMLInputElement).value).toBe('85');
  });

  it('задаёт дневную норму внутри компактного раздела', async () => {
    const wrapper = mount(PreferencesView);
    await wrapper.get('[data-testid="target-settings"]').trigger('click');
    await wrapper.find('#target').setValue('2000');
    await wrapper.findElementByText('button', 'Задать норму').trigger('click');

    expect(setManualTarget).toHaveBeenCalledWith(2000);
  });
});
