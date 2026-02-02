<script setup lang="ts">
import { SquarePlus } from 'lucide-vue-next';
import { ref, watch } from 'vue';
import { useNodeStore } from '@/stores/useNodeStore';

const store = useNodeStore();
const newContainerName = ref('');
const errorMessage = ref('');

const handleAddContainer = () => {
    const name = newContainerName.value.trim();
    if (!name) {
        errorMessage.value = 'Container name is required';
        return;
    }

    if (!store.isContainerNameUnique(name)) {
        errorMessage.value = 'A container with this name already exists';
        return;
    }

    store.addContainer(name);
    newContainerName.value = '';
    errorMessage.value = '';
};
// Clear error when user starts typing
watch(newContainerName, () => {
    if (errorMessage.value) errorMessage.value = '';
});
</script>

<template>
    <div class="mb-6 flex items-start gap-4 rounded bg-white p-4 shadow-sm">
        <div class="flex-1">
            <label
                for="container-name"
                class="block text-sm font-medium text-gray-700"
                >Container Name</label
            >
            <input
                id="container-name"
                v-model="newContainerName"
                type="text"
                :class="[
                    'mt-1 block w-full rounded-md border p-2 shadow-sm transition-colors sm:text-sm',
                    errorMessage
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                ]"
                placeholder="e.g. Panel A"
                @keydown.enter="handleAddContainer"
            />
            <p
                v-if="errorMessage"
                class="mt-1 text-xs font-medium text-red-700"
            >
                {{ errorMessage }}
            </p>
        </div>
        <button
            @click="handleAddContainer"
            class="mt-6 flex h-9 cursor-pointer items-center gap-2 rounded bg-blue-700 px-4 py-2 text-white transition-colors hover:bg-blue-800"
        >
            <SquarePlus class="size-4" />
            Add Container
        </button>
    </div>
</template>
