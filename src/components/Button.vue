<template>
  <button class="button" type="button" v-bind="rootTraits">
    <slot />
  </button>
</template>

<script lang="ts">
import { busy, color, spacing } from '@/traits'

// Module scope, as defineProps() can't reference variables of <script setup>
const traits = [spacing, color, busy] as const
</script>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { densityKey, type Density } from '@/density'
import { traitProps, useTraits } from '@/lib/use-traits'

// Runtime props from the traits; Card.vue uses type-based props
const props = defineProps({ ...traitProps(traits) })

const density = inject(densityKey, ref<Density>('comfortable'))

const rootTraits = useTraits(props, traits, {
  // Reactive default: compact density makes the button smaller, unless
  // spacing is given
  defaults: {
    spacing: () => (density.value === 'compact' ? 'sm' : undefined),
  },
})
</script>

<style scoped>
.button {
  /* Component defaults; declaring the vars here also stops inheritance */
  --spacing: var(--spacing-md);
  --color-bg: var(--color-grey-bg);
  --color-fg: var(--color-grey-fg);

  padding: var(--spacing) calc(var(--spacing) * 2);
  border: 0;
  border-radius: 4px;
  background: var(--color-bg);
  color: var(--color-fg);
  font: inherit;
  cursor: pointer;
}

.button[aria-busy='true'] {
  opacity: 0.6;
  cursor: progress;
}
</style>
