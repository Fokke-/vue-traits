# Changelog

## 1.0.0-beta.1 (2026-10-14)

First beta.

- `createTrait()` defines a trait: a props interface, its defaults and a `resolve` function that outputs `vars` (CSS custom properties), `class`, `style` and `attrs`.
- `useTraits()` resolves traits into a computed object for `v-bind`, from component props or from a getter or ref for inner elements. It type-checks that the component declares every trait prop, and the values a getter or ref returns.
  - `defaults` option: component-level defaults, as values, refs or getters.
  - `values` option: trait values from refs or getters instead of props, e.g. `defineModel()`.
- `traitProps()` creates runtime prop definitions for `defineProps({ … })`.
- `traitDefaults()` merges trait defaults, e.g. for `withDefaults()`.
- Warns in development when traits share a prop with different defaults, and when `resolve` returns a ref or a getter instead of a value.
- Types: `Trait`, `TraitOutput`, `TraitPropValues`, `TraitsProps`, `TraitValueSources`, `UseTraitsOptions`.
