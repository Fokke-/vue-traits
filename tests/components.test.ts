// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import CardBox from './fixtures/CardBox.vue'
import DensityBox from './fixtures/DensityBox.vue'
import ModelBox from './fixtures/ModelBox.vue'
import RuntimeBox from './fixtures/RuntimeBox.vue'
import TypedBox from './fixtures/TypedBox.vue'
import { type Density, densityKey } from './fixtures/traits'

/** Value of a custom property in the element's inline style */
const cssVar = (el: Element, name: string) =>
  (el as HTMLElement).style.getPropertyValue(name)

describe('rendering', () => {
  it('renders classes, custom properties and attributes', () => {
    const wrapper = mount(TypedBox, { props: { size: 'lg', tone: 'red' } })
    expect(wrapper.classes()).toEqual(['box', 'tone-red', 'rounded'])
    expect(cssVar(wrapper.element, '--size')).toBe('var(--size-lg)')
    expect(wrapper.attributes('data-tone')).toBe('red')
  })

  it('renders no style or trait attributes without values', () => {
    const wrapper = mount(TypedBox)
    expect(wrapper.attributes('style')).toBeUndefined()
    expect(wrapper.attributes('data-tone')).toBeUndefined()
  })

  it('merges the class and style given by the parent', () => {
    const wrapper = mount(TypedBox, {
      props: { size: 'sm', tone: 'blue' },
      attrs: { class: 'parent', style: 'color: red' },
    })
    expect(wrapper.classes()).toEqual(['box', 'tone-blue', 'rounded', 'parent'])
    expect(cssVar(wrapper.element, '--size')).toBe('var(--size-sm)')
    expect((wrapper.element as HTMLElement).style.color).toBe('red')
  })

  it('updates when a prop changes', async () => {
    const wrapper = mount(TypedBox, { props: { tone: 'red' } })
    await wrapper.setProps({ tone: 'blue', size: 'md' })
    expect(wrapper.classes()).toContain('tone-blue')
    expect(wrapper.classes()).not.toContain('tone-red')
    expect(wrapper.attributes('data-tone')).toBe('blue')
    expect(cssVar(wrapper.element, '--size')).toBe('var(--size-md)')
  })
})

describe('boolean props', () => {
  it('casts runtime props from traitProps() like Vue booleans', () => {
    // An empty string is what Vue receives for `<RuntimeBox rounded />`
    expect(
      mount(RuntimeBox, { props: { rounded: '' as never } }).classes(),
    ).toContain('rounded')
    expect(
      mount(RuntimeBox, { props: { rounded: false } }).classes(),
    ).not.toContain('rounded')
  })

  it('applies the trait default to an absent runtime boolean prop', () => {
    expect(mount(RuntimeBox).classes()).toContain('rounded')
  })

  it('applies the trait default to an absent type-based boolean prop', () => {
    expect(mount(TypedBox).classes()).toContain('rounded')
    expect(
      mount(TypedBox, { props: { rounded: false } }).classes(),
    ).not.toContain('rounded')
  })
})

describe('values from outside props', () => {
  it('reads a defineModel() value from the parent', async () => {
    const wrapper = mount(ModelBox, { props: { size: 'sm' } })
    expect(cssVar(wrapper.element, '--size')).toBe('var(--size-sm)')
    await wrapper.setProps({ size: 'md' })
    expect(cssVar(wrapper.element, '--size')).toBe('var(--size-md)')
  })

  it('follows a defineModel() value set by the component', async () => {
    const wrapper = mount(ModelBox)
    expect(wrapper.attributes('style')).toBeUndefined()
    await wrapper.get('button').trigger('click')
    expect(cssVar(wrapper.element, '--size')).toBe('var(--size-lg)')
    expect(wrapper.emitted('update:size')).toEqual([['lg']])
  })

  it('resolves traits of an inner element from an object prop', async () => {
    const wrapper = mount(CardBox)
    expect(wrapper.get('header').attributes('style')).toBeUndefined()
    await wrapper.setProps({ headerProps: { size: 'sm' } })
    expect(cssVar(wrapper.get('header').element, '--size')).toBe(
      'var(--size-sm)',
    )
  })
})

describe('reactive defaults', () => {
  it('follows a default that depends on an injected value', async () => {
    const density = ref<Density>('comfortable')
    const wrapper = mount(DensityBox, {
      global: { provide: { [densityKey as symbol]: density } },
    })
    expect(wrapper.attributes('style')).toBeUndefined()

    density.value = 'compact'
    await wrapper.vm.$nextTick()
    expect(cssVar(wrapper.element, '--size')).toBe('var(--size-sm)')

    await wrapper.setProps({ size: 'lg' })
    expect(cssVar(wrapper.element, '--size')).toBe('var(--size-lg)')
  })
})
