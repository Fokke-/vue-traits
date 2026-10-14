import { describe, expect, it } from 'vitest'
import * as lib from '@/entry-lib'

describe('entry-lib', () => {
  it('exports the public functions', () => {
    expect(Object.keys(lib).sort()).toEqual([
      'createTrait',
      'traitDefaults',
      'traitProps',
      'useTraits',
    ])
  })
})
