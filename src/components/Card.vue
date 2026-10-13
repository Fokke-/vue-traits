<template>
  <div class="card" v-bind="rootTraits">
    <header class="card__header" v-bind="headerTraits">
      <h2 v-if="props.title">
        {{ props.title }}
      </h2>
    </header>
    <div class="card__body" v-bind="bodyTraits">
      <pre v-if="props.debug">{{
        { rootTraits, headerTraits, bodyTraits }
      }}</pre>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTraits } from '@/lib/use-traits'
import {
  type BorderRadius,
  type Elevation,
  type Gap,
  type Padding,
  type TextColor,
  borderRadius,
  elevation,
  gap,
  padding,
  textColor,
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

const radius = defineModel<BorderRadius['borderRadius']>('borderRadius')

// The CSS variable defaults are in the styles below; elevation outputs a
// class name, so its component default is set here
const rootTraits = useTraits(
  props,
  [padding, borderRadius, elevation, textColor, gap],
  {
    defaults: { elevation: 1 },
    values: { borderRadius: radius },
  },
)

const headerTraits = useTraits(() => props.headerProps ?? {}, [padding])

const bodyTraits = useTraits(() => props.bodyProps ?? {}, [padding])
</script>

<style scoped>
.card {
  /* Component defaults; declaring the vars here also stops inheritance */
  --padding: 30px;
  --border-radius: 10px;
  --gap: 30px;

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
  /* Own default, so the card's --padding doesn't leak in */
  --padding: 0;

  padding: 0 var(--padding);
}

.card__header h2 {
  color: var(--text-color, inherit);
}
</style>
