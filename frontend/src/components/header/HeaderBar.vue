<template>
  <header>
    <div class="logo-container">
      <img v-if="showLogo" :src="logoURL" />
      <span v-if="showLogo" class="logo-text">Drive</span>
    </div>

    <slot />
    <div id="dropdown">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useLayoutStore } from "@/stores/layout";

import { logoURL } from "@/utils/constants";

import Action from "@/components/header/Action.vue";
import { computed, useSlots } from "vue";
import { useI18n } from "vue-i18n";

defineProps<{
  showLogo?: boolean;
  showMenu?: boolean;
}>();

const layoutStore = useLayoutStore();
const slots = useSlots();

const { t } = useI18n();

const ifActionsSlot = computed(() => (slots.actions ? true : false));
</script>

<style></style>
