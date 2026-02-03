<script setup lang="ts">
defineProps<{
    side: 'top' | 'bottom';
}>();
</script>

<template>
    <div
        class="absolute right-0 left-0 z-50 h-1 rounded-full bg-yellow-500"
        :class="[side === 'top' ? '-top-2' : '-bottom-2']"
    ></div>
</template>
