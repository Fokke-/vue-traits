import type { InjectionKey, Ref } from 'vue'
import { createTrait } from '@/entry-lib'

// Traits for the component tests, separate from the demo app's traits

export interface Size {
  size?: 'sm' | 'md' | 'lg'
}

/** CSS variable trait without a default */
export const size = createTrait<Size>({
  defaults: { size: undefined },
  resolve: ({ size }) => ({ vars: { size: size && `var(--size-${size})` } }),
})

export interface Tone {
  tone?: 'red' | 'blue'
}

/** Outputs a class and a data attribute */
export const tone = createTrait<Tone>({
  defaults: { tone: undefined },
  resolve: ({ tone }) => ({
    class: tone && `tone-${tone}`,
    attrs: { 'data-tone': tone },
  }),
})

export interface Rounded {
  rounded?: boolean
}

/** Boolean trait whose default is `true`, so it differs from Vue's `false` */
export const rounded = createTrait<Rounded>({
  defaults: { rounded: true },
  resolve: ({ rounded }) => ({ class: rounded && 'rounded' }),
})

export type Density = 'comfortable' | 'compact'

export const densityKey: InjectionKey<Ref<Density>> = Symbol('density')
