import type { Profile } from '@/shared/db';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { setLocale, useLiveQuery } from '@/shared/lib';
import ProfileView from './index.vue';

vi.mock('@/entities/profile', async importOriginal => ({
  ...await importOriginal<typeof import('@/entities/profile')>(),
  loadProfile: vi.fn(),
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

describe('профиль', () => {
  it('показывает главные параметры без формы', () => {
    const wrapper = mount(ProfileView, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    });

    expect(wrapper.text()).toContain('Профиль');
    expect(wrapper.text()).toContain('2 100');
    expect(wrapper.text()).toContain('85 kg');
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('показывает разделы профиля', () => {
    const wrapper = mount(ProfileView, {
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    });

    expect(wrapper.text()).toContain('Настройки');
    expect(wrapper.text()).toContain('Мои блюда');
    expect(wrapper.text()).toContain('Данные и приватность');
  });
});
