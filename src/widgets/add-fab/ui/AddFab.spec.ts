import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import AddFab from './AddFab.vue';

async function pointer(element: Element, type: string, clientX: number, clientY: number) {
  element.dispatchEvent(new MouseEvent(type, { bubbles: true, button: 0, clientX, clientY }));
  await nextTick();
}

describe('add fab', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('does nothing on a short tap', async () => {
    const wrapper = mount(AddFab);

    await wrapper.get('.add-fab-trigger').trigger('click');

    expect(wrapper.emitted('select')).toBeUndefined();
  });

  it('reveals the radial actions after a hold', async () => {
    vi.useFakeTimers();
    const wrapper = mount(AddFab);

    await pointer(wrapper.get('.add-fab-trigger').element, 'pointerdown', 350, 810);
    await vi.advanceTimersByTimeAsync(360);
    await nextTick();

    expect(wrapper.findAll('[data-add-action]')).toHaveLength(3);
  });

  it('selects an action when the held pointer slides over it', async () => {
    vi.useFakeTimers();
    const wrapper = mount(AddFab);
    const trigger = wrapper.get('.add-fab-trigger');

    await pointer(trigger.element, 'pointerdown', 350, 810);
    await vi.advanceTimersByTimeAsync(360);
    await nextTick();

    const barcode = wrapper.get('[data-add-action="barcode"]');
    vi.spyOn(barcode.element, 'getBoundingClientRect').mockReturnValue({
      bottom: 658,
      height: 58,
      left: 300,
      right: 358,
      top: 600,
      width: 58,
      x: 300,
      y: 600,
      toJSON: () => ({}),
    });

    await pointer(trigger.element, 'pointermove', 329, 629);
    expect(barcode.classes()).toContain('is-active');

    await pointer(trigger.element, 'pointerup', 329, 629);
    expect(wrapper.emitted('select')).toEqual([['barcode']]);
  });
});
