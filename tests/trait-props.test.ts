import { describe, expect, it, vi } from 'vitest'
import { createTrait, traitDefaults, traitProps } from '@/entry-lib'

const spacing = createTrait<{ spacing?: string }>({
  defaults: { spacing: 'md' },
  resolve: () => ({}),
})

const busy = createTrait<{ busy?: boolean }>({
  defaults: { busy: false },
  resolve: () => ({}),
})

const color = createTrait<{ color?: string }>({
  defaults: { color: undefined },
  resolve: () => ({}),
})

describe('createTrait', () => {
  it('returns the definition as is', () => {
    const definition = { defaults: { a: 1 }, resolve: () => ({}) }
    expect(createTrait<{ a?: number }>(definition)).toBe(definition)
  })
})

describe('traitDefaults', () => {
  it('merges the defaults of the given traits', () => {
    expect(traitDefaults([spacing, busy, color])).toStrictEqual({
      spacing: 'md',
      busy: false,
      color: undefined,
    })
  })

  it('lets the later trait win for a shared prop', () => {
    // A shared prop with different defaults warns in development
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const small = createTrait<{ spacing?: string }>({
      defaults: { spacing: 'sm' },
      resolve: () => ({}),
    })
    expect(traitDefaults([spacing, small])).toEqual({ spacing: 'sm' })
    warn.mockRestore()
  })

  it('returns an empty object for no traits', () => {
    expect(traitDefaults([])).toEqual({})
  })
})

describe('traitProps', () => {
  it('declares boolean props for boolean defaults, untyped props otherwise', () => {
    expect(traitProps([spacing, busy, color])).toStrictEqual({
      spacing: { type: null },
      busy: { type: Boolean, default: undefined },
      color: { type: null },
    })
  })
})
