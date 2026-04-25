<template>
  <div class="psd-viewer">
    <div v-if="loading" class="loading delayed">
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
    </div>
    <div v-else-if="error" class="error">
      <i class="material-icons">error</i>
      <p>{{ error }}</p>
    </div>
    <ExtendedImage v-else :src="imageSrc" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { readPsd } from 'ag-psd';
import ExtendedImage from './ExtendedImage.vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  src: string;
}>();

const authStore = useAuthStore();
const loading = ref(true);
const error = ref<string | null>(null);
const imageSrc = ref<string>('');

const loadPsd = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(props.src, {
      headers: {
        'X-Auth': authStore.jwt
      }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const buffer = await response.arrayBuffer();
    const psd = readPsd(buffer);
    
    if (psd && psd.canvas) {
      imageSrc.value = psd.canvas.toDataURL('image/png');
    } else {
      throw new Error('Could not extract image from PSD');
    }
  } catch (e: any) {
    console.error('Failed to load PSD:', e);
    error.value = 'Failed to load PSD file';
  } finally {
    loading.value = false;
  }
};

onMounted(loadPsd);
watch(() => props.src, loadPsd);
</script>

<style scoped>
.psd-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error {
  text-align: center;
  color: var(--icon-red);
}

.error i {
  font-size: 48px;
  margin-bottom: 10px;
}
</style>
