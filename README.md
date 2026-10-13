# vue-traits

Typed, reusable style props for Vue components. Define a trait once, use it in every component of your design system.

## Why

- Design system components often expose the same knobs: spacing, color, radius, elevation. Without a shared pattern, every component repeats the prop type, the default and the styling logic.
- A **trait** bundles a prop interface, its defaults and its output (a class name or CSS variables) in one place. A component opts in with two lines.
- **Why not just a composable?** A composable shares the logic, but each component still declares the props, wires up defaults and merges the results by hand. `useTraits` combines any number of traits into one object for `v-bind`, and type-checks that the component actually declares every trait's props.
- Small (~1 kB gzipped)
- Works with SSR

## Install

```sh
npm install vue-traits
```

Requires Vue `^3.5.29`.

## Quick start

Define traits:

```ts
// traits.ts
import { createTrait } from 'vue-traits'

export interface Spacing {
  spacing?: 'sm' | 'md' | 'lg'
}

export const spacing = createTrait<Spacing>({
  defaults: { spacing: 'md' },
  resolve: ({ spacing }) => ({ class: `spacing-${spacing}` }),
})

export interface Radius {
  radius?: 'none' | 'md' | 'full'
}

export const radius = createTrait<Radius>({
  defaults: { radius: 'md' },
  resolve: ({ radius }) => ({ class: `radius-${radius}` }),
})
```

Use them in a component:

```vue
<!-- Button.vue -->
<script setup lang="ts">
import { useTraits } from 'vue-traits'
import { type Radius, type Spacing, radius, spacing } from './traits'

const props = defineProps<Spacing & Radius>()
const traits = useTraits(props, [spacing, radius])
</script>

<template>
  <button v-bind="traits"><slot /></button>
</template>
```

```vue
<Button spacing="lg" radius="full">Save</Button>
<!-- <button class="spacing-lg radius-full">Save</button> -->

<Button>Cancel</Button>
<!-- <button class="spacing-md radius-md">Cancel</button> -->
```

Prop types come from the trait's interface, so `<Button spacing="xl">` is a type error.

## CSS variables or class names

A trait's `resolve` returns any combination of `vars`, `class` and `style`. Prefer CSS variables or class names.

### CSS variables (recommended for shared traits)

The trait outputs a reference to a design token. Each component decides which CSS property it affects: padding in a button, gap in a stack.

```ts
export const spacing = createTrait<Spacing>({
  defaults: { spacing: undefined }, // no default: the component's CSS decides
  resolve: ({ spacing }) => ({
    vars: { spacing: spacing && `var(--spacing-${spacing})` },
  }),
})
```

```css
.button {
  --spacing: var(--spacing-md); /* component default */
  padding: var(--spacing);
}
```

- With no value, the trait outputs nothing and the component's own default applies.
- Declare the variable on the component itself, as above. CSS variables inherit, so this keeps a value set on an ancestor from leaking in.
- You can also set the default with `useTraits(props, [spacing], { defaults: { spacing: 'md' } })`, but then it renders as an inline style on every instance and stylesheets can no longer override it.
- Keys are converted to custom property names: `textColor` → `--text-color`. Keys starting with `--` are kept as is.

### Class names

Good when a trait has one fixed, global meaning, e.g. `elevation-2` for a shadow. Note that scoped component styles are more specific than global utility classes; manage the order with `@layer` if both set the same property.

### Inline styles

`style` works too, but inline styles override every stylesheet, which makes theming and overrides harder.

### Combining outputs

A trait can return several outputs at once. For example, variables carry the values and a class lets CSS target the variant for rules a value can't express, such as a hover state:

```ts
export const color = createTrait<Color>({
  defaults: { color: undefined },
  resolve: ({ color }) => ({
    class: color && `color-${color}`,
    vars: {
      colorBg: color && `var(--color-${color}-bg)`,
      colorFg: color && `var(--color-${color}-fg)`,
    },
  }),
})
```

```vue
<Button color="red">Delete</Button>
<!-- <button class="color-red" style="--color-bg: var(--color-red-bg); --color-fg: var(--color-red-fg)"> -->
```

## Multiple traits and elements

Pass several traits at once; their classes and styles are merged. `class` and `style` passed by the parent are merged by Vue as usual.

```ts
const props = defineProps<Spacing & Color>()
const traits = useTraits(props, [spacing, color])
```

For inner elements, take an object prop and pass a getter:

```ts
const props = defineProps<{ headerProps?: Spacing }>()
const headerTraits = useTraits(() => props.headerProps ?? {}, [spacing])
```

```vue
<Card :header-props="{ spacing: 'sm' }" />
```

## Defaults

From weakest to strongest:

1. the trait's `defaults`
2. component defaults: `useTraits(props, traits, { defaults: { spacing: "lg" } })`
3. `withDefaults()` of the component
4. the value passed to the component

`undefined` means "not given": the next default applies, and if there is none, the trait outputs nothing. `null` is an explicit empty value: it overrides all defaults and is passed to `resolve` as is, so the trait decides what it means. For example, a `textColor` trait could map `null` to `initial`. In a design system, an explicit token such as `spacing="none"` is often clearer.

## Advanced

**Values from refs or getters**, e.g. `defineModel()`, instead of props:

```ts
const props = defineProps<Color>()
const spacingModel = defineModel<Spacing['spacing']>('spacing')
const traits = useTraits(props, [spacing, color], {
  values: { spacing: spacingModel },
})
```

**Runtime props declaration:**

```ts
const props = defineProps({ ...traitProps(spacing, color) })
const traits = useTraits(props, [spacing, color])
```

**Boolean props:** Vue casts an absent boolean prop to `false`. With type-based props, use `withDefaults(defineProps<…>(), { flag: undefined })` to let the trait default apply. With `traitProps()`, give boolean traits a boolean default; it is used to detect the prop type.

## Without TypeScript

The package is plain JavaScript. In a JS project, annotate traits with JSDoc and declare props at runtime:

```js
// traits.js
import { createTrait } from 'vue-traits'

/** @typedef {{ spacing?: "sm" | "md" | "lg" }} Spacing */

/** @type {import("vue-traits").Trait<Spacing>} */
export const spacing = createTrait({
  defaults: { spacing: 'md' },
  resolve: ({ spacing }) => ({ class: `spacing-${spacing}` }),
})
```

```vue
<!-- Button.vue -->
<script setup>
import { traitProps, useTraits } from 'vue-traits'
import { spacing } from './traits'

const props = defineProps({ ...traitProps(spacing) })
const traits = useTraits(props, [spacing])
</script>

<template>
  <button v-bind="traits"><slot /></button>
</template>
```

- Without the JSDoc annotation the trait works the same, but its prop type is inferred as `string`, so editors can't suggest the allowed values.
- Editors such as VS Code read the package's type declarations for JS files too, so completions and hover info work out of the box. To also see type errors, enable `checkJs` in `jsconfig.json` or add `// @ts-check` to a file.

## API

| Export                                           | Description                                                                                                                                   |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `createTrait<P>({ defaults, resolve })`          | Defines a trait for the props interface `P`.                                                                                                  |
| `useTraits(props, traits, options?)`             | Resolves traits into a computed `{ class, style }` object for `v-bind`. `props` can also be a getter or ref. `options`: `defaults`, `values`. |
| `traitProps(...traits)`                          | Runtime prop definitions for `defineProps({ … })`.                                                                                            |
| `traitDefaults(...traits)`                       | Merged trait defaults.                                                                                                                        |
| `Trait`, `TraitOutput`, `TraitPropValues`        | Trait definition, `resolve` output, prop values passed to `resolve`.                                                                          |
| `TraitsProps`, `TraitValues`, `UseTraitsOptions` | Combined props of traits, `values` option, `useTraits` options.                                                                               |

## Development

```sh
pnpm install
pnpm dev    # demo app
pnpm build  # library and type declarations into dist/
```

## License

MIT © [Ville Fokke Saarivaara](https://fokke.fi)
