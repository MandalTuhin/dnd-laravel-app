<template>
    <!-- Indicator for Empty Container -->
    <div
        v-if="isDraggingOverEmpty"
        class="absolute inset-x-4 top-1/2 z-50 h-1 -translate-y-1/2 rounded-full bg-green-500"
    />

    <!-- Insertion Indicators for individual items -->
    <template v-for="(_, index) in itemCount" :key="`indicator-${index}`">
        <div
            v-if="indicatorIndex === index"
            class="absolute top-2 bottom-2 z-50 w-1 rounded-full bg-green-500 transition-all"
            :class="[indicatorSide === 'left' ? 'left-0' : 'right-0']"
            :style="{
                left:
                    indicatorSide === 'left'
                        ? `${(index * 100) / itemCount}%`
                        : 'auto',
                right:
                    indicatorSide === 'right'
                        ? `${((itemCount - index - 1) * 100) / itemCount}%`
                        : 'auto',
            }"
        />
    </template>
</template>

<script setup lang="ts">
defineProps<{
    isDraggingOverEmpty: boolean;
    indicatorIndex: number | null;
    indicatorSide: 'left' | 'right';
    itemCount: number;
}>();
</script>
