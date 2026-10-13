<template>
  <div class="card" v-bind="rootTraits">
    <header class="card__header" v-bind="headerTraits">
      <h2 v-if="props.title">
        {{ props.title }}
      </h2>
    </header>
    <div class="card__body" v-bind="bodyTraits">
      <template v-if="props.debug">
        <pre v-if="debug">{{ { rootTraits, headerTraits, bodyTraits } }}</pre>
      </template>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTraits } from '@/lib/use-traits'
import {
  type BorderRadius,
  type Elevation,
  type Padding,
  type TextColor,
  type Gap,
  borderRadius,
  elevation,
  padding,
  textColor,
  gap,
} from '@/traits'

const props = withDefaults(
  defineProps<
    {
      title?: string
      debug?: boolean
      headerProps?: Padding
      bodyProps?: Padding
    } & Padding &
      Elevation &
      TextColor &
      Gap
  >(),
  {
    title: undefined,
    debug: false,
    headerProps: undefined,
    bodyProps: undefined,
  },
)

const radius = defineModel<BorderRadius['borderRadius']>('borderRadius', {
  default: borderRadius.defaults.borderRadius,
})

const rootTraits = useTraits(
  props,
  [padding, borderRadius, elevation, textColor, gap],
  {
    defaults: { padding: 30, elevation: 1, gap: 30 },
    values: { borderRadius: radius },
  },
)

const headerTraits = useTraits(() => props.headerProps ?? {}, [padding], {
  defaults: { padding: 0 },
})

const bodyTraits = useTraits(() => props.bodyProps ?? {}, [padding], {
  defaults: { padding: 0 },
})
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: var(--gap);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  background: #fff;
  padding: var(--padding);
  border-radius: var(--border-radius);
}

.card__header,
.card__body {
  padding: 0 var(--padding);
}

.card__header h2 {
  color: var(--text-color, inherit);
}
</style>
