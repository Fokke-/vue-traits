import type { ClassValue, StyleValue } from 'vue'

/** Attributes a trait contributes to the element it is bound to */
export interface TraitOutput {
  /** Inline CSS styles */
  style?: StyleValue

  /** Class name(s) */
  class?: ClassValue

  /**
   * CSS custom properties. camelCase keys are hyphenated and prefixed
   * (`textColor` → `--text-color`); keys starting with `--` are kept as is.
   */
  vars?: Record<string, string | number | null | undefined>

  /**
   * Other attributes, e.g. `aria-*` or `data-*`. `undefined` and `null`
   * leave the attribute out; `false` renders as `"false"`.
   */
  attrs?: Record<string, unknown>
}

/**
 * Every prop of P with its value type. Keys are required, values of optional
 * props may be `undefined`.
 */
export type TraitPropValues<P> = { [K in keyof Required<P>]: P[K] }

/**
 * @typeParam P Props interface of the trait. Components using type-based
 * defineProps() include it in their props type, e.g. `defineProps<Own & P>()`.
 */
export interface Trait<P extends object = object> {
  /**
   * Default value for every prop of the trait. Every key must be listed;
   * `undefined` means no default (the trait outputs nothing and the
   * component's CSS decides). Boolean props need a boolean default for
   * runtime props (traitProps()) to cast `<Comp flag />` to `true`.
   */
  defaults: TraitPropValues<P>

  /**
   * Maps prop values (defaults applied) to attributes. `undefined` = no value
   * given; `null` = explicit empty value, its meaning is up to the trait.
   * Runs inside a computed, so reactive values read here (`label.value`) are
   * tracked. Return plain values, not refs or getters, and keep it free of
   * side effects.
   */
  resolve(props: TraitPropValues<P>): TraitOutput
}

/**
 * Defines a trait: a reusable set of props and the attributes they produce.
 * Returns the definition as is; it exists to infer and check the types.
 *
 * @typeParam P Props interface of the trait.
 * @example
 * ```ts
 * export interface Spacing {
 *   spacing?: 'sm' | 'md' | 'lg'
 * }
 *
 * export const spacing = createTrait<Spacing>({
 *   defaults: { spacing: 'md' },
 *   resolve: ({ spacing }) => ({ class: `spacing-${spacing}` }),
 * })
 * ```
 */
export const createTrait = <P extends object>(trait: Trait<P>): Trait<P> =>
  trait
