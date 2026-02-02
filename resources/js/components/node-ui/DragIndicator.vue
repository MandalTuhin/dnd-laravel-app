<script setup lang="ts">
defineProps<{
  index: number | null;
  side: 'top' | 'bottom';
}>();
</script>

<template>
  <div
    v-if="index !== null"
    class="absolute left-0 right-0 h-1 bg-yellow-500 z-50 rounded-full"
    :class="[side === 'top' ? '-top-2' : '-bottom-2']"
  ></div>
</template>
