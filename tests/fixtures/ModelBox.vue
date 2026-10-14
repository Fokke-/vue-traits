<template>
  <div v-bind="traits">
    <button type="button" @click="model = 'lg'">Large</button>
  </div>
</template>

<script setup lang="ts">
import { useTraits } from '@/entry-lib'
import { type Size, size } from './traits'

const model = defineModel<Size['size']>('size')

const traits = useTraits(() => ({}), [size], { values: { size: model } })
</script>
