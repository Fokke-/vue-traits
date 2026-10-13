import type { InjectionKey, Ref } from 'vue'

export type Density = 'comfortable' | 'compact'

/** Density provided by an ancestor; components use it for reactive defaults */
export const densityKey: InjectionKey<Ref<Density>> = Symbol('density')
