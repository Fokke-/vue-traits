import {
  computed,
  mergeProps,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
  type PropType,
  type Ref,
} from 'vue'
import type { Trait, TraitPropValues } from './create-trait'

type UnionToIntersection<U> = (
  U extends unknown ? (arg: U) => void : never
) extends (arg: infer I) => void
  ? I
  : never

type AnyTrait = Trait<any>

/** Combined props interface of the given traits */
export type TraitsProps<T extends readonly AnyTrait[]> = UnionToIntersection<
  T[number] extends Trait<infer P> ? P : never
>

/** Merges the defaults of the given traits, e.g. for withDefaults() */
export const traitDefaults = <const T extends readonly AnyTrait[]>(traits: T) =>
  Object.assign({}, ...traits.map((t) => t.defaults)) as TraitPropValues<
    TraitsProps<T>
  >

/**
 * Runtime prop definitions of the given traits, for runtime defineProps().
 * Props get no Vue default, so defaults resolve in useTraits() exactly as
 * with type-based props. Runtime type validation is skipped except for
 * boolean props, which need `Boolean` for attribute casting and an explicit
 * `default: undefined` so that an absent prop is not cast to `false`.
 * Boolean props are detected from the trait default, so boolean traits need
 * a boolean default.
 */
export const traitProps = <const T extends readonly AnyTrait[]>(traits: T) =>
  Object.fromEntries(
    Object.entries(traitDefaults(traits)).map(([key, value]) => [
      key,
      typeof value === 'boolean'
        ? { type: Boolean, default: undefined }
        : { type: null },
    ]),
  ) as unknown as {
    [K in keyof TraitsProps<T>]-?: {
      type: PropType<Exclude<TraitsProps<T>[K], undefined>>
      required: false
    }
  }

/** Refs or getters supplying trait values from outside props, e.g. defineModel() */
export type TraitValueSources<T extends readonly AnyTrait[]> = {
  [K in keyof Required<TraitsProps<T>>]?: MaybeRefOrGetter<TraitsProps<T>[K]>
}

export interface UseTraitsOptions<
  T extends readonly AnyTrait[],
  V extends TraitValueSources<T> = TraitValueSources<T>,
> {
  /**
   * Component-level defaults, override the trait defaults. Each default can
   * be a value, a ref or a getter; as with `values`, a function is called as
   * a getter.
   */
  defaults?: TraitValueSources<T>
  /** Values read from refs or getters instead of props */
  values?: V
}

/**
 * Requires the trait props missing from P (and not given in `values`), so a
 * forgotten prop declaration is a type error naming the missing prop.
 */
type MissingProps<P, T extends readonly AnyTrait[], V> = {
  [K in Exclude<keyof Required<TraitsProps<T>>, keyof P | keyof V>]:
    TraitsProps<T>[K] | undefined
}

/**
 * Resolves the given traits into reactive attributes: class, style and the
 * traits' `attrs`.
 *
 * Value precedence, first defined (not `undefined`) wins: `values` or source
 * value (Vue has already applied withDefaults() and defineModel() defaults) >
 * `options.defaults` > trait defaults. If none is defined, the trait gets
 * `undefined`. `null` is an explicit empty value: it overrides all defaults
 * and is passed to the trait's `resolve` as is.
 */
export function useTraits<
  const T extends readonly AnyTrait[],
  P extends Partial<TraitsProps<T>>,
  V extends TraitValueSources<T> = {},
>(
  /**
   * Component props; every trait prop not in `values` must be declared.
   * The key must exist in the props type; it may be optional, as with
   * runtime props from traitProps().
   */
  props: P & MissingProps<P, T, V>,
  traits: T,
  options?: UseTraitsOptions<T, V>,
): ComputedRef<Record<string, unknown>>
export function useTraits<const T extends readonly AnyTrait[]>(
  /** Getter or ref to a partial object, e.g. `() => props.headerProps ?? {}` */
  source: (() => Partial<TraitsProps<T>>) | Ref<Partial<TraitsProps<T>>>,
  traits: T,
  options?: UseTraitsOptions<T>,
): ComputedRef<Record<string, unknown>>
export function useTraits(
  source: MaybeRefOrGetter<object>,
  traits: readonly AnyTrait[],
  options: { defaults?: object; values?: object } = {},
) {
  return computed(() => {
    const props = toValue(source) as Record<string, unknown>
    const defaults = (options.defaults ?? {}) as Record<
      string,
      MaybeRefOrGetter<unknown>
    >
    const values = (options.values ?? {}) as Record<
      string,
      MaybeRefOrGetter<unknown>
    >
    const merged = mergeProps(
      ...traits.map((t) => {
        const resolved = { ...t.defaults } as Record<string, unknown>
        for (const key in resolved) {
          const value = key in values ? toValue(values[key]) : props[key]
          const found = value !== undefined ? value : toValue(defaults[key])
          if (found !== undefined) resolved[key] = found
        }
        // Only the known keys are used; anything else resolve returns is
        // ignored, so a typo such as `clas` doesn't end up as an attribute
        const { class: cls, style, vars, attrs } = t.resolve(resolved)
        const output = mergeProps(attrs ?? {}, { class: cls, style })
        if (!vars) return output
        // textColor → --text-color (hyphenated like Vue's style binding);
        // keys starting with -- are kept as is
        const varStyle = Object.fromEntries(
          Object.entries(vars).map(([key, value]) => [
            key.startsWith('--')
              ? key
              : `--${key.replace(/\B([A-Z])/g, '-$1').toLowerCase()}`,
            value,
          ]),
        )
        return mergeProps(output, { style: varStyle })
      }),
    )

    // Leave out empty attributes, e.g. `style=""` when no trait has a value.
    // mergeProps() has normalized class to a string and style to an object.
    if (merged.class === '') delete merged.class
    if (merged.style) {
      const style = Object.fromEntries(
        Object.entries(merged.style).filter(([, v]) => v != null && v !== ''),
      )
      if (Object.keys(style).length) merged.style = style
      else delete merged.style
    }
    return merged
  })
}
