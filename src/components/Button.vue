<template>
  <button class="button" type="button" v-bind="rootTraits">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useTraits } from '@/lib/use-traits'
import { type Color, type Spacing, color, spacing } from '@/traits'

const props = defineProps<Spacing & Color>()

const rootTraits = useTraits(props, [spacing, color])
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
</style>
