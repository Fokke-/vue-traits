import { createTrait } from '@/lib/create-trait'

/**
 * Appends `px` to numbers and numeric strings, passes other values through.
 * `null` and `undefined` are returned as is, so Vue leaves the style out.
 */
function toPx(value: string | number): string
function toPx(
  value: string | number | null | undefined,
): string | null | undefined
function toPx(value: string | number | null | undefined) {
  if (value == null) return value
  return /^-?\d*\.?\d+$/.test(String(value)) ? `${value}px` : String(value)
}

export interface Padding {
  /** Padding, exposed as `--padding`; numbers are px. Not set = component default */
  padding?: string | number
}

export const padding = createTrait<Padding>({
  defaults: { padding: undefined },
  resolve: (props) => ({
    vars: { padding: toPx(props.padding) },
  }),
})

export interface BorderRadius {
  /** Border radius, exposed as `--border-radius`; numbers are px. Not set = component default */
  borderRadius?: string | number
}

export const borderRadius = createTrait<BorderRadius>({
  defaults: { borderRadius: undefined },
  resolve: (props) => ({
    vars: { borderRadius: toPx(props.borderRadius) },
  }),
})

export interface Elevation {
  /** Shadow depth, 0–3 */
  elevation?: string | number
}

export const elevation = createTrait<Elevation>({
  defaults: { elevation: 0 },
  resolve: (props) => ({ class: `elevation-${props.elevation}` }),
})

export interface Gap {
  /** Gap, exposed as `--gap`; numbers are px. Not set = component default */
  gap?: string | number
}

export const gap = createTrait<Gap>({
  defaults: { gap: undefined },
  resolve: (props) => ({ vars: { gap: toPx(props.gap) } }),
})

export interface TextColor {
  /**
   * Text color, exposed to component styles as `--text-color`. `null` sets
   * the var to `initial`, so `var(--text-color, fallback)` uses its fallback.
   */
  textColor?: string | null
}

export const textColor = createTrait<TextColor>({
  defaults: { textColor: undefined },
  resolve: (props) => ({
    vars: {
      textColor: props.textColor === null ? 'initial' : props.textColor,
    },
  }),
})

export interface Spacing {
  /** Spacing token, exposed as `--spacing`; not set = component default */
  spacing?: 'sm' | 'md' | 'lg'
}

export const spacing = createTrait<Spacing>({
  defaults: { spacing: undefined },
  resolve: (props) => ({
    vars: { spacing: props.spacing && `var(--spacing-${props.spacing})` },
  }),
})

export interface Color {
  /** Color scheme, exposed as `--color-bg` and `--color-fg`; not set = component default */
  color?: 'red' | 'grey'
}

export const color = createTrait<Color>({
  defaults: { color: undefined },
  resolve: (props) => ({
    vars: {
      colorBg: props.color && `var(--color-${props.color}-bg)`,
      colorFg: props.color && `var(--color-${props.color}-fg)`,
    },
  }),
})
