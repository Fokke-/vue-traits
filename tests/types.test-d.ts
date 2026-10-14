import { describe, expectTypeOf, it } from 'vitest'
import {
  type ComputedRef,
  type PropType,
  computed,
  defineProps,
  ref,
  withDefaults,
} from 'vue'
import {
  type TraitsProps,
  createTrait,
  traitDefaults,
  traitProps,
  useTraits,
} from '@/entry-lib'
import { type Size, type Tone, size, tone } from './fixtures/traits'

describe('createTrait', () => {
  it('requires every prop in defaults', () => {
    createTrait<Size & Tone>({
      // @ts-expect-error `tone` is missing
      defaults: { size: undefined },
      resolve: () => ({}),
    })
  })

  it('passes every prop to resolve, optional ones possibly undefined', () => {
    createTrait<Size>({
      defaults: { size: 'md' },
      resolve: (props) => {
        expectTypeOf(props).toEqualTypeOf<{
          size: 'sm' | 'md' | 'lg' | undefined
        }>()
        return {}
      },
    })
  })

  it('accepts any attribute in attrs', () => {
    createTrait<Size>({
      defaults: { size: undefined },
      resolve: ({ size }) => ({
        attrs: { 'aria-label': size, 'data-size': size, onClick: () => {} },
      }),
    })
  })

  it('rejects unknown output keys', () => {
    createTrait<Size>({
      defaults: { size: undefined },
      // @ts-expect-error typo of `class`
      resolve: ({ size }) => ({ clas: size }),
    })
  })

  it('rejects refs in style and vars', () => {
    const label = ref('x')
    createTrait<Size>({
      defaults: { size: undefined },
      // @ts-expect-error a ref is not a style value
      resolve: () => ({ style: label }),
    })
    createTrait<Size>({
      defaults: { size: undefined },
      // @ts-expect-error a ref is not a custom property value
      resolve: () => ({ vars: { gap: label } }),
    })
  })
})

describe('useTraits', () => {
  it('returns a computed object of attributes', () => {
    const props = {} as Size & Tone
    expectTypeOf(useTraits(props, [size, tone])).toEqualTypeOf<
      ComputedRef<Record<string, unknown>>
    >()
  })

  it('requires the component to declare every trait prop', () => {
    const props = {} as Tone
    // @ts-expect-error `size` is not declared
    useTraits(props, [size, tone])
  })

  it('accepts optional prop keys, as declared by traitProps()', () => {
    const props = {} as { size?: Size['size']; tone?: Tone['tone'] }
    useTraits(props, [size, tone])
  })

  it('does not require props that come from the values option', () => {
    const props = {} as Tone
    useTraits(props, [size, tone], { values: { size: ref('sm') } })
  })

  it('accepts values, refs and getters as defaults and values', () => {
    const props = {} as Size & Tone
    useTraits(props, [size, tone], {
      defaults: { size: 'sm', tone: ref('red') },
      values: { size: () => 'lg' as const },
    })
  })

  it('rejects defaults and values of the wrong type', () => {
    const props = {} as Size
    // @ts-expect-error not a size
    useTraits(props, [size], { defaults: { size: 'xl' } })
    // @ts-expect-error the getter returns no size
    useTraits(props, [size], { defaults: { size: () => 'xl' } })
    // @ts-expect-error the ref holds no size
    useTraits(props, [size], { values: { size: ref(1) } })
  })

  it('accepts a getter or a ref to a partial object as the source', () => {
    useTraits(() => ({ size: 'sm' as const }), [size, tone])
    useTraits(() => ({}), [size, tone])
    useTraits(ref<Size>({}), [size, tone])
  })

  it('checks the values of a getter or a ref source', () => {
    // @ts-expect-error not a size
    useTraits(() => ({ size: 'xl' as const }), [size])
    // @ts-expect-error not a trait prop
    useTraits(() => ({ bogus: 1 }), [size])
    // @ts-expect-error not a size
    useTraits(ref({ size: 'xl' as const }), [size])
    const computedSize = computed(() => ({ size: 'xl' as const }))
    // @ts-expect-error not a size
    useTraits(computedSize, [size])
  })
})

describe('TraitsProps', () => {
  it('combines the props of the given traits', () => {
    expectTypeOf<TraitsProps<[typeof size, typeof tone]>>().toEqualTypeOf<
      Size & Tone
    >()
  })

  it('intersects the type of a prop shared by several traits', () => {
    const ab = createTrait<{ v?: 'a' | 'b' }>({
      defaults: { v: undefined },
      resolve: () => ({}),
    })
    const bc = createTrait<{ v?: 'b' | 'c' }>({
      defaults: { v: undefined },
      resolve: () => ({}),
    })
    expectTypeOf<TraitsProps<[typeof ab, typeof bc]>['v']>().toEqualTypeOf<
      'b' | undefined
    >()
  })
})

describe('traitProps', () => {
  it('returns typed runtime prop definitions', () => {
    expectTypeOf(traitProps([size])).toEqualTypeOf<{
      size: { type: PropType<'sm' | 'md' | 'lg'>; required: false }
    }>()
  })
})

describe('traitDefaults', () => {
  it('returns every prop with its value type', () => {
    expectTypeOf(traitDefaults([size, tone])).toEqualTypeOf<{
      size: Size['size']
      tone: Tone['tone']
    }>()
  })

  it('works as withDefaults() defaults', () => {
    const medium = createTrait<Size>({
      defaults: { size: 'md' },
      resolve: () => ({}),
    })
    const props = withDefaults(defineProps<Size>(), traitDefaults([medium]))
    expectTypeOf(props.size).toEqualTypeOf<'sm' | 'md' | 'lg'>()
  })
})
