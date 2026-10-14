<template>
  <div>
    <header v-bind="headerTraits" />
  </div>
</template>

<script setup lang="ts">
import { useTraits } from '@/entry-lib'
import { type Size, size } from './traits'

const props = defineProps<{ headerProps?: Size }>()

const headerTraits = useTraits(() => props.headerProps ?? {}, [size])
</script>
