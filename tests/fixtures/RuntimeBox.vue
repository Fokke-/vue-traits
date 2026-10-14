<template>
  <div v-bind="attrs" />
</template>

<script lang="ts">
import { rounded, size, tone } from './traits'

// Module scope, as defineProps() can't reference variables of <script setup>
const traits = [size, tone, rounded] as const
</script>

<script setup lang="ts">
import { traitProps, useTraits } from '@/entry-lib'

const props = defineProps({ ...traitProps(traits) })

const attrs = useTraits(props, traits)
</script>
