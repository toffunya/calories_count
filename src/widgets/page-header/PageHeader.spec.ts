import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import PageHeader from './PageHeader.vue';

it('keeps the title centered initially, moves it left on downward scroll and restores it on upward scroll', async () => {
  const host = document.createElement('main');
  document.body.append(host);
  const wrapper = mount(PageHeader, { attachTo: host, props: { title: 'Каталог', showBack: false }, global: { stubs: { RouterLink: true } } });
  try {
    expect(wrapper.classes()).not.toContain('compact');
    host.scrollTop = 120;
    host.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(wrapper.classes()).toContain('compact');
    host.scrollTop = 100;
    host.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(wrapper.classes()).not.toContain('compact');
    host.scrollTop = 150;
    host.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(wrapper.classes()).toContain('compact');
    host.scrollTop = 0;
    host.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(wrapper.classes()).not.toContain('compact');
  }
  finally {
    wrapper.unmount();
    host.remove();
  }
});
