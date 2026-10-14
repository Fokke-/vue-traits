<template>
  <Card title="Controls">
    <div class="input-wrap">
      <label for="border-radius"
        >Border radius (v-model, CSS var, {{ borderRadius }}px)</label
      >
      <input
        id="border-radius"
        type="range"
        v-model="borderRadius"
        min="0"
        max="100"
      />
    </div>
    <div class="input-wrap">
      <label for="padding">Padding (CSS var, {{ padding }}px)</label>
      <input id="padding" type="range" v-model="padding" min="0" max="100" />
    </div>
    <div class="input-wrap">
      <label for="elevation">Elevation (class name, {{ elevation }})</label>
      <input id="elevation" type="range" v-model="elevation" min="0" max="3" />
    </div>
    <div class="input-wrap">
      <label for="header-padding">
        Header padding (CSS var, {{ headerPadding }}px)
      </label>
      <input
        id="header-padding"
        type="range"
        v-model="headerPadding"
        min="0"
        max="100"
      />
    </div>
    <div class="input-wrap">
      <label for="body-padding">
        Body padding (CSS var, {{ bodyPadding }}px)
      </label>
      <input
        id="body-padding"
        type="range"
        v-model="bodyPadding"
        min="0"
        max="100"
      />
    </div>
    <div class="input-wrap">
      <label for="text-color">Title color (CSS var, {{ textColor }})</label>
      <input id="text-color" type="color" v-model="textColor" />
    </div>
    <div class="input-wrap">
      <label for="gap">Gap (CSS var, {{ gap }}px)</label>
      <input id="gap" type="range" v-model="gap" min="0" max="100" />
    </div>
  </Card>
  <Card
    debug
    title="Hello world"
    :text-color="textColor"
    v-model:border-radius="borderRadius"
    :padding="padding"
    :elevation="elevation"
    :gap="gap"
    :header-props="{ padding: headerPadding }"
    :body-props="{ padding: bodyPadding }"
  >
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos
      laborum sapiente unde nulla nemo ea minus dicta doloremque sint?
      Repudiandae est harum, ducimus laborum excepturi aspernatur hic illum eum
      voluptatem.
    </p>
  </Card>
  <Card title="Buttons">
    <div class="input-wrap">
      <label for="button-spacing">Spacing (CSS var token)</label>
      <select id="button-spacing" v-model="buttonSpacing">
        <option :value="undefined">Default</option>
        <option value="sm">sm</option>
        <option value="md">md</option>
        <option value="lg">lg</option>
      </select>
    </div>
    <div class="input-wrap">
      <label for="button-color">Color (CSS var token)</label>
      <select id="button-color" v-model="buttonColor">
        <option :value="undefined">Default</option>
        <option value="red">Red</option>
        <option value="grey">Grey</option>
      </select>
    </div>
    <div class="input-wrap">
      <label>
        <input type="checkbox" v-model="buttonBusy" />
        Busy (attrs, aria-busy)
      </label>
    </div>
    <div class="input-wrap">
      <label for="density">
        Density (reactive default: compact = sm spacing if not set)
      </label>
      <select id="density" v-model="density">
        <option value="comfortable">Comfortable</option>
        <option value="compact">Compact</option>
      </select>
    </div>
    <div class="input-wrap button-row">
      <Button :spacing="buttonSpacing" :color="buttonColor" :busy="buttonBusy">
        Controlled
      </Button>
      <Button>Default</Button>
      <Button spacing="sm" color="red">Small red</Button>
    </div>
    <div class="input-wrap button-row" :style="leakTest">
      <Button>Default inside lg/red wrapper</Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import Button from './components/Button.vue'
import Card from './components/Card.vue'
import { densityKey, type Density } from './density'
import type { Color, Spacing } from './traits'

const borderRadius = ref(10)
const padding = ref(30)
const gap = ref(30)
const elevation = ref(1)
const headerPadding = ref(0)
const bodyPadding = ref(0)
const textColor = ref('#008080')
const buttonSpacing = ref<Spacing['spacing']>()
const buttonColor = ref<Color['color']>()
const buttonBusy = ref(false)

const density = ref<Density>('comfortable')
provide(densityKey, density)

// Sets the vars on an ancestor: the button inside must keep its own defaults
const leakTest = {
  '--spacing': 'var(--spacing-lg)',
  '--color-bg': 'var(--color-red-bg)',
  '--color-fg': 'var(--color-red-fg)',
}
</script>

<style>
:root {
  --spacing-sm: 4px;
  --spacing-md: 8px;
  --spacing-lg: 16px;

  --color-red-bg: #d32f2f;
  --color-red-fg: #fff;
  --color-grey-bg: #ddd;
  --color-grey-fg: #000;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  font-family: sans-serif;
  gap: clamp(1rem, 5vw, 2rem);
  width: 100vw;
  min-height: 100dvh;
  padding: 5vw;
  background: #dadada;
}

.input-wrap {
  + & {
    margin-top: 1em;
  }
}

label {
  display: block;
}

input[type='range'] {
  width: 100%;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.elevation-1 {
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
}

.elevation-2 {
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
}

.elevation-3 {
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.25);
}

h2 {
  margin: 0;
}

p {
  margin: 0;

  &:not(:last-child) {
    margin-bottom: 1em;
  }
}

select {
  min-width: 100px;
  padding-top: 0.3em;
  padding-bottom: 0.3em;
}
</style>
