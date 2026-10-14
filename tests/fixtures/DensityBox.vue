<template>
  <div v-bind="traits" />
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { useTraits } from '@/entry-lib'
import { type Density, type Size, densityKey, size } from './traits'

const props = defineProps<Size>()

const density = inject(densityKey, ref<Density>('comfortable'))

const traits = useTraits(props, [size], {
  defaults: { size: () => (density.value === 'compact' ? 'sm' : undefined) },
})
</script>
