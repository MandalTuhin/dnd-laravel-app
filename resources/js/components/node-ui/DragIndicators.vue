<template>
  <!-- Indicator for Empty Container -->
  <div
    v-if="isDraggingOverEmpty"
    class="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full z-50"
  />

  <!-- Insertion Indicators for individual items -->
  <template v-for="(_, index) in itemCount" :key="`indicator-${index}`">
    <div
      v-if="indicatorIndex === index"
      class="absolute top-2 bottom-2 w-1 bg-green-500 z-50 rounded-full transition-all"
      :class="[indicatorSide === 'left' ? 'left-0' : 'right-0']"
      :style="{
        left: indicatorSide === 'left' ? `${(index * 100) / itemCount}%` : 'auto',
        right: indicatorSide === 'right' ? `${((itemCount - index - 1) * 100) / itemCount}%` : 'auto'
      }"
    />
  </template>
</template>

<script setup lang="ts">
defineProps<{
  isDraggingOverEmpty: boolean
  indicatorIndex: number | null
  indicatorSide: 'left' | 'right'
  itemCount: number
}>()
</script>
