import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive, ref } from 'vue'
import { createTrait, useTraits } from '@/entry-lib'

interface Size {
  size?: string | null
}

/** Trait that outputs its value as a class, and records what resolve got */
const sizeTrait = (defaultSize?: string) => {
  const received: unknown[] = []
  const trait = createTrait<Size>({
    defaults: { size: defaultSize },
    resolve: ({ size }) => {
      received.push(size)
      return { class: size && `size-${size}` }
    },
  })
  return { trait, received }
}

describe('value resolution', () => {
  it('uses the trait default when no value is given', () => {
    const { trait } = sizeTrait('md')
    expect(useTraits(() => ({}), [trait]).value).toEqual({ class: 'size-md' })
  })

  it('lets component defaults override the trait default', () => {
    const { trait } = sizeTrait('md')
    const attrs = useTraits(() => ({}), [trait], { defaults: { size: 'lg' } })
    expect(attrs.value).toEqual({ class: 'size-lg' })
  })

  it('lets the prop value override component defaults', () => {
    const { trait } = sizeTrait('md')
    const attrs = useTraits(() => ({ size: 'sm' }), [trait], {
      defaults: { size: 'lg' },
    })
    expect(attrs.value).toEqual({ class: 'size-sm' })
  })

  it('reads values from the values option instead of props', () => {
    const { trait } = sizeTrait('md')
    const attrs = useTraits(() => ({ size: 'sm' }), [trait], {
      values: { size: ref('xl') },
    })
    expect(attrs.value).toEqual({ class: 'size-xl' })
  })

  it('treats undefined as not given', () => {
    const { trait, received } = sizeTrait('md')
    const attrs = useTraits(() => ({ size: undefined }), [trait], {
      defaults: { size: undefined },
    })
    expect(attrs.value).toEqual({ class: 'size-md' })

    const { trait: noDefault, received: noDefaultReceived } = sizeTrait()
    expect(useTraits(() => ({}), [noDefault]).value).toEqual({})
    expect(noDefaultReceived).toEqual([undefined])
    expect(received).toEqual(['md'])
  })

  it('passes null to resolve as is, overriding all defaults', () => {
    const { trait, received } = sizeTrait('md')
    const attrs = useTraits(() => ({ size: null }), [trait], {
      defaults: { size: 'lg' },
    })
    expect(attrs.value).toEqual({})
    expect(received).toEqual([null])
  })
})

describe('output', () => {
  const output = (resolve: () => object) =>
    createTrait<{ x?: number }>({
      defaults: { x: 1 },
      resolve: resolve as () => never,
    })

  it('converts vars to custom properties', () => {
    const trait = output(() => ({
      vars: { textColor: 'red', gap: 4, '--Keep-As-Is': 1 },
    }))
    expect(useTraits(() => ({}), [trait]).value).toEqual({
      style: { '--text-color': 'red', '--gap': 4, '--Keep-As-Is': 1 },
    })
  })

  it('combines class, style, vars and attrs', () => {
    const trait = output(() => ({
      class: ['a', { b: true }],
      style: { color: 'red' },
      vars: { gap: '1px' },
      attrs: { 'aria-busy': true, 'data-variant': 'primary' },
    }))
    expect(useTraits(() => ({}), [trait]).value).toEqual({
      class: 'a b',
      style: { color: 'red', '--gap': '1px' },
      'aria-busy': true,
      'data-variant': 'primary',
    })
  })

  it('leaves out empty values but keeps 0', () => {
    const trait = output(() => ({
      class: '',
      style: { color: '' },
      vars: { a: undefined, b: null, c: '', zero: 0 },
    }))
    expect(useTraits(() => ({}), [trait]).value).toEqual({
      style: { '--zero': 0 },
    })
  })

  it('renders nothing for an empty output', () => {
    expect(useTraits(() => ({}), [output(() => ({}))]).value).toEqual({})
  })

  it('ignores unknown keys returned by resolve', () => {
    const trait = output(() => ({ id: 'x', clas: 'typo', class: 'ok' }))
    expect(useTraits(() => ({}), [trait]).value).toEqual({ class: 'ok' })
  })

  it('lets the later trait win for style, vars and attrs', () => {
    const first = output(() => ({
      style: { color: 'red' },
      vars: { gap: 1 },
      attrs: { 'data-v': 'first' },
    }))
    const second = output(() => ({
      style: { color: 'blue' },
      vars: { gap: 2 },
      attrs: { 'data-v': 'second' },
    }))
    expect(useTraits(() => ({}), [first, second]).value).toEqual({
      style: { color: 'blue', '--gap': 2 },
      'data-v': 'second',
    })
  })

  it('keeps the classes of both traits', () => {
    const first = output(() => ({ class: 'size-sm' }))
    const second = output(() => ({ class: 'size-lg' }))
    expect(useTraits(() => ({}), [first, second]).value).toEqual({
      class: 'size-sm size-lg',
    })
  })

  it('merges event listeners from several traits', () => {
    const onFirst = () => {}
    const onSecond = () => {}
    const first = output(() => ({ attrs: { onClick: onFirst } }))
    const second = output(() => ({ attrs: { onClick: onSecond } }))
    expect(useTraits(() => ({}), [first, second]).value.onClick).toEqual([
      onFirst,
      onSecond,
    ])
  })
})

describe('reactivity', () => {
  it('follows reactive props', () => {
    const { trait } = sizeTrait('md')
    const props = reactive<Size>({ size: 'sm' })
    const attrs = useTraits(props, [trait])
    expect(attrs.value.class).toBe('size-sm')
    props.size = 'lg'
    expect(attrs.value.class).toBe('size-lg')
  })

  it('follows a ref source, both deep changes and replacement', () => {
    const { trait } = sizeTrait('md')
    const source = ref<Size>({ size: 'sm' })
    const attrs = useTraits(source, [trait])
    expect(attrs.value.class).toBe('size-sm')
    source.value.size = 'lg'
    expect(attrs.value.class).toBe('size-lg')
    source.value = { size: 'xl' }
    expect(attrs.value.class).toBe('size-xl')
  })

  it('follows a getter source whose object appears later', () => {
    const { trait } = sizeTrait('md')
    const props = reactive<{ inner?: Size }>({})
    const attrs = useTraits(() => props.inner ?? {}, [trait])
    expect(attrs.value.class).toBe('size-md')
    props.inner = { size: 'sm' }
    expect(attrs.value.class).toBe('size-sm')
  })

  it('follows refs in the values option', () => {
    const { trait } = sizeTrait('md')
    const size = ref('sm')
    const attrs = useTraits(() => ({}), [trait], { values: { size } })
    expect(attrs.value.class).toBe('size-sm')
    size.value = 'lg'
    expect(attrs.value.class).toBe('size-lg')
  })

  it('follows refs and getters in the defaults option', () => {
    const { trait } = sizeTrait('md')
    const size = ref('sm')
    const compact = ref(true)
    const fromRef = useTraits(() => ({}), [trait], { defaults: { size } })
    const fromGetter = useTraits(() => ({}), [trait], {
      defaults: { size: () => (compact.value ? 'sm' : 'lg') },
    })
    size.value = 'xl'
    compact.value = false
    expect(fromRef.value.class).toBe('size-xl')
    expect(fromGetter.value.class).toBe('size-lg')
  })

  it('follows reactive values read inside resolve', () => {
    const label = ref('Open')
    const trait = createTrait<{ x?: number }>({
      defaults: { x: 1 },
      resolve: () => ({ attrs: { 'aria-label': label.value } }),
    })
    const attrs = useTraits(() => ({}), [trait])
    expect(attrs.value['aria-label']).toBe('Open')
    label.value = 'Close'
    expect(attrs.value['aria-label']).toBe('Close')
  })
})

describe('development warnings', () => {
  // Each warning is shown once per module, so every test gets a fresh one
  let lib: typeof import('@/entry-lib')
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.resetModules()
    lib = await import('@/entry-lib')
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  const sizeWithDefault = (size: unknown) =>
    lib.createTrait<{ size?: unknown }>({
      defaults: { size },
      resolve: () => ({}),
    })

  const output = (resolve: () => object) =>
    lib.createTrait<{ x?: number }>({
      defaults: { x: 1 },
      resolve: resolve as () => never,
    })

  it('warns once about a prop shared with different defaults', () => {
    const traits = [sizeWithDefault('sm'), sizeWithDefault('lg')] as const
    lib.useTraits(() => ({}), traits)
    lib.useTraits(() => ({}), traits)
    lib.traitDefaults(traits)
    lib.traitProps(traits)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('"size"')
  })

  it('does not warn about a prop shared with the same default', () => {
    lib.useTraits(() => ({}), [sizeWithDefault('sm'), sizeWithDefault('sm')])
    lib.useTraits(() => ({}), [sizeWithDefault(NaN), sizeWithDefault(NaN)])
    expect(warn).not.toHaveBeenCalled()
  })

  it.each([
    [
      'a ref in attrs',
      { attrs: { 'aria-label': ref('x') } },
      'attrs.aria-label',
    ],
    ['a getter in attrs', { attrs: { title: () => 'x' } }, 'attrs.title'],
    ['a ref in vars', { vars: { gap: ref(1) } }, 'vars.gap'],
    ['a ref as class', { class: ref('x') }, '"class"'],
  ])('warns about %s returned by resolve', (_, result, path) => {
    lib.useTraits(() => ({}), [output(() => result)]).value
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain(path)
  })

  it('does not warn about event listeners or plain values', () => {
    const trait = output(() => ({
      class: 'a',
      vars: { gap: 1 },
      attrs: { onClick: () => {}, 'aria-label': 'x' },
    }))
    lib.useTraits(() => ({}), [trait]).value
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const conflicting = [sizeWithDefault('sm'), sizeWithDefault('lg')] as const
    lib.useTraits(() => ({}), conflicting)
    lib.traitDefaults(conflicting)
    lib.useTraits(() => ({}), [output(() => ({ class: ref('x') }))]).value
    expect(warn).not.toHaveBeenCalled()
  })
})
