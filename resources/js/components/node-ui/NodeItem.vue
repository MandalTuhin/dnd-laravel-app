<script setup lang="ts">
import { GripVertical } from 'lucide-vue-next';

defineProps<{
    name: string;
    isDragging?: boolean;
}>();
</script>

<template>
    <div
        class="node-item relative flex min-h-12 cursor-grab items-center justify-center rounded-lg border-2 border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50 p-3 pl-8 text-center font-semibold text-blue-700 transition-all duration-200 select-none"
        :class="[
            isDragging
                ? 'border-blue-400 shadow-lg'
                : 'hover:border-blue-400 hover:shadow-md active:cursor-grabbing',
        ]"
    >
        <!-- Drag handle icon using Lucide -->
        <div class="absolute top-1/2 left-2 -translate-y-1/2 text-blue-400">
            <GripVertical :size="16" />
        </div>

        {{ name }}
    </div>
</template>
