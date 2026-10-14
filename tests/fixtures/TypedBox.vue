<template>
  <div class="box" v-bind="traits" />
</template>

<script setup lang="ts">
import { useTraits } from '@/entry-lib'
import {
  type Rounded,
  type Size,
  type Tone,
  rounded,
  size,
  tone,
} from './traits'

// Type-based props; `rounded: undefined` keeps Vue from casting an absent
// boolean to false, so the trait default applies
const props = withDefaults(defineProps<Size & Tone & Rounded>(), {
  rounded: undefined,
})

const traits = useTraits(props, [size, tone, rounded])
</script>
