<template>
  <button @click="action" :aria-label="label" :title="label" class="action" :class="{ 'with-label': showLabel }">
    <i class="material-icons">{{ icon }}</i>
    <span :class="showLabel ? 'label' : 'menu-label'">{{ label }}</span>
    <span v-if="counter && counter > 0" class="counter">{{ counter }}</span>
  </button>
</template>

<script setup lang="ts">
import { useLayoutStore } from "@/stores/layout";

const props = defineProps<{
  icon?: string;
  label?: string;
  counter?: number;
  show?: string;
  showLabel?: boolean;
}>();

const emit = defineEmits<{
  (e: "action"): any;
}>();

const layoutStore = useLayoutStore();

const action = () => {
  if (props.show) {
    layoutStore.showHover(props.show);
  }

  emit("action");
};
</script>
<style scoped>
.action {
  width: 40px;
  height: 40px;
  display: flex !important;
  align-items: center;
  justify-content: center;
  border-radius: 50% !important;
  color: var(--iconPrimary) !important;
  transition: background-color 0.2s !important;
  margin: 0 4px !important;
  padding: 0 !important;
}

.action.with-label {
  width: auto !important;
  border-radius: 20px !important;
  padding: 0 16px 0 12px !important;
}

.action:hover {
  background-color: var(--hover) !important;
}

.action.active {
  color: var(--blue) !important;
}

.action.active i {
  color: var(--blue) !important;
}

.action i {
  font-size: 20px !important;
  padding: 0 !important;
}

.action span.label {
  display: inline-block !important;
  margin-left: 8px;
  font-size: 14px;
  font-weight: 500;
}

.action span.menu-label {
  display: none !important;
}

.action span:not(.counter):not(.label):not(.menu-label) {
  display: none;
}

.counter {
  background: #1a73e8 !important;
  color: white !important;
  border: none !important;
}
</style>
